import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'
import filsesize from 'rollup-plugin-filesize';
import execute from 'rollup-plugin-shell';

import { author, license } from './package.json'

const external = [
	'react',
	'react/jsx-runtime',
	'use-sync-external-store',
	'use-sync-external-store/shim',
	'use-sync-external-store/shim/with-selector',
	'react-native'
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
	SOURCE_FOLDER,
	PACKAGE_NAME
) => {
	const OUTPUT_DIR = `${BASE_OUTPUT_DIR}dist`
	const SOURCE_INDEX_FILE = `${SOURCE_FOLDER}/index.ts`
	const { banner } = getProjectNameAndBanner(PACKAGE_NAME);

	/**
	 * Options
	 */
	const sourcemap = true;

	const nativeFiles = fg.sync(`${SOURCE_FOLDER}/**/*`);

	const fixFileName = (fileName) => {
		return fileName.includes('src/') 
			? fileName.split('src/')[1] 
			: fileName
	}

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
			{
				generateBundle(options, bundle) {
					fs.writeFileSync(path.resolve(__dirname, 'Test.json'), JSON.stringify(bundle, null, 2), {
						encoding: 'utf-8' 
					})
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					bundle = Object.entries(bundle)
					.reduce((obj, [key, value]) => {
						value.fileName = fixFileName(value.fileName)

						if ( value.code ) {
							const mat = value.code.match(/'.*http-service\/.*';/g) ?? [];

							mat.map((fileName) => fileName.replace("'", '').replace("';", ''))
							.forEach((fileName) => {
								const [_base] = fileName.split('src');
								const base = `${_base}src/${value.fileName}`

								const newFilename = path.relative(base, fileName).split('/');

								newFilename.shift();

								value.code = value.code.replace(
									fileName,
									newFilename.join('/')
								)
							})
						}

						if ( value.importedBindings ) {
							value.importedBindings = Object.entries(value.importedBindings)
							.reduce((obj, [key, value]) => {
								obj[fixFileName(key)] = value;
								return obj
							}, {})
						}

						if ( value.imports ) {
							value.imports = value.imports
							.map((value) => fixFileName(value))
						}

						obj[fixFileName(key)] = value;
						return obj;
					}, {})
					fs.writeFileSync(path.resolve(__dirname, 'Test2.json'), JSON.stringify(bundle, null, 2), {
						encoding: 'utf-8' 
					})
					return null;
				}
			},
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
			})
		],
		...input
	})

	// JS modules for bundlers
	const modules = [
		getDefault({
			input: [SOURCE_INDEX_FILE, ...nativeFiles]
		})
	];

	return modules;
}

const executeCommandToCreateAndFixTypes = (packageNames) => {
	const commands = packageNames.map(({ packageName, folderName }) => {
		const { banner } = getProjectNameAndBanner(packageName);
		// Generates types for each project
		return `tsc --project ./scripts/tsconfig.${packageName}.json && npm run injectBannerIntoDeclarations -- --folder "./packages/${folderName}/dist" --text "${banner}"`
	});

	// Fix react-fetch types
	commands.push('npm run merge-types')

	return execute({ 
		commands: [commands.join(' && ')], 
		hook: 'buildStart' 
	})
}

export default function rollup() {
	return [
		...getPackage(
			'./packages/http-service/',
			'./packages/http-service/src',
			'http-service'
		),
		...getPackage(
			'./packages/react-fetch/',
			'./packages/react-fetch/src',
			'react-fetch'
		),
		{
			input: './empty.js',
			plugins: [
				executeCommandToCreateAndFixTypes([
					{
						packageName: 'http-service',
						folderName: 'http-service'
					},
					{
						packageName: 'react-fetch',
						folderName: 'react-fetch'
					}
				])
			]
		}
	];
}
