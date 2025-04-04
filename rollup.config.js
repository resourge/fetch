import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs, { readFileSync } from 'fs';
import path from 'path';
import filsesize from 'rollup-plugin-filesize';
import execute from 'rollup-plugin-shell';

const pkg = JSON.parse(readFileSync('package.json', {
	encoding: 'utf8' 
}));

const { author, license } = pkg

const external = [
	'react',
	'react-dom',
	'react/jsx-runtime',
	'use-sync-external-store',
	'use-sync-external-store/shim',
	'use-sync-external-store/shim/with-selector',
	'react-native',
	'@resourge/http-service',
	'@react-native-community/netinfo',
	'@resourge/history-store',
	'@resourge/history-store/mobile',
	'@resourge/history-store/utils'
];

const babelPlugins = [
	'babel-plugin-dev-expression'
]

const babelPresetEnv = ['@babel/preset-env', {
	targets: [
		'defaults',
		'not IE 11',
		'chrome > 78', // To remove in the future
		'maintained node versions'
	],
	loose: true,
	bugfixes: true
}]

const defaultExtPlugin = [
	filsesize({
		showBeforeSizes: 'build'
	}),
	nodeResolve({
		extensions: ['.tsx', '.ts', '.native.ts', '.native.tsx']
	})
]

function createBanner(libraryName, version, authorName, license) {
	return `/**
 * ${libraryName} v${version}
 *
 * Copyright (c) ${authorName}.
 *
 * This source code is licensed under the ${license} license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license ${license}
 */`;
}

function getName(name) {
	const arr = name.split('/');

	return arr[arr.length - 1];
}

/**
 * Package Json info
 */
const VERSION = process.env.PROJECT_VERSION;
const AUTHOR_NAME = author;
const LICENSE = license;

const getProjectNameAndBanner = (
	PACKAGE_NAME
) => {
	const PROJECT_NAME = getName(PACKAGE_NAME);
	const banner = createBanner(PROJECT_NAME, VERSION, AUTHOR_NAME, LICENSE);

	return {
		PROJECT_NAME,
		banner
	}
}

const getPackage = (
	BASE_OUTPUT_DIR,
	SOURCE_INDEXS,
	PACKAGE_NAME,
	merge
) => {
	const OUTPUT_DIR = `${BASE_OUTPUT_DIR}dist`
	const { banner } = getProjectNameAndBanner(PACKAGE_NAME);

	/**
	 * Options
	 */
	const sourcemap = true;

	const getDefault = (input) => ({
		output: {
			dir: OUTPUT_DIR,
			format: 'esm',
			sourcemap,
			banner,
			preserveModules: true,
			entryFileNames: () => '[name].js'
		},
		external,
		plugins: [
			...defaultExtPlugin,
			babel({
				comments: false,
				exclude: /node_modules/,
				babelHelpers: 'bundled',
				presets: [
					babelPresetEnv,
					['@babel/preset-react', {
						useBuiltIns: true,
						runtime: 'automatic'
					}],
					'@babel/preset-typescript'
				],
				plugins: babelPlugins,
				extensions: ['.ts', '.tsx']
			}),
			execute({
				commands: [`tsc --project ./scripts/tsconfig.${PACKAGE_NAME}.json && npm run injectBannerIntoDeclarations -- --folder "${OUTPUT_DIR}" --text "${banner}"`],
				sync: true,
				hook: 'buildEnd'
			}), 
			{
				name: 'remove-js-extension',
				generateBundle(_, bundle) {
					for (const file of Object.keys(bundle)) {
						const chunk = bundle[file];

						if (chunk.type === 'chunk') {
							chunk.code = chunk.code.replace(/(from\s+['"]\.\/[^'"]+)\.js(['"])/g, '$1$2');
						}
					}
				}
			},
			{
				name: 'include-native-plugin',

				resolveId(source, importer) {
					if (!importer) return null;

					// Resolve the original file
					const resolved = path.resolve(source);

					if ( fs.existsSync(resolved) ) {
						const extname = path.extname(resolved);
						const basename = path.basename(resolved, extname);
						const dirname = path.dirname(resolved);
						const nativeId = path.join(dirname, `${basename}.native${extname}`);

						// Check if the .native version exists
						if (fs.existsSync(nativeId)) {
							// Ensure both the regular and .native versions are bundled
							this.emitFile({
								type: 'chunk',
								id: nativeId
							})
						}

						return resolved;
					}
				}

			}
		],
		...input
	})

	if (merge) {
		/* // #region Create build and change http-services for the package version
		await mergeDirs(SOURCE_FOLDER, BUILD_FOLDER, {
			overwrite: true
		})

		const files = await getFiles(BUILD_FOLDER);

		await Promise.all(
			files.map(async (fileName) => {
				let code = await fs.promises.readFile(fileName, {
					encoding: 'utf-8' 
				})

				const mat = code.match(/'.*http-service\/.*'/g) ?? [];

				mat
				.map((fileName) => fileName.replace("'", '').replace("'", ''))
				.forEach((fileName) => {
					code = code.replace(
						fileName,
						'@resourge/http-service'
					)
				})

				return await fs.promises.writeFile(fileName, code, {
					encoding: 'utf-8' 
				})
			})
		);
		// #endregion Create build and change http-services for the package version
 */
		// #region Update package json dependency
		const packageJson = JSON.parse(fs.readFileSync(`${BASE_OUTPUT_DIR}/package.json`, 'utf-8'));

		Object.keys(packageJson.dependencies)
		.filter((key) => key.includes('@resourge/http-service'))
		.forEach((key) => {
			packageJson.dependencies[key] = VERSION ?? '1.0.0'
		})

		fs.writeFileSync(`${BASE_OUTPUT_DIR}/package.json`, JSON.stringify(packageJson, null, 2), 'utf-8')
		// #endregion Update package json dependency
	}

	return [
		getDefault({
			input: SOURCE_INDEXS
		})
	];
}

export default function rollup() {
	return [
		...getPackage(
			'./packages/http-service/',
			[
				'./packages/http-service/src/index.ts'
			],
			'http-service'
		),
		...getPackage(
			'./packages/react-fetch/',
			[
				'./packages/react-fetch/src/index.ts',
				'./packages/react-fetch/src/index.native.ts'
			],
			'react-fetch',
			true
		),
		{
			input: './empty.js',
			plugins: [
				execute({
					commands: ['npm run fixReactFetch'],
					sync: true,
					hook: 'buildStart'
				})
			]
		}

	];
}
