import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import filsesize from 'rollup-plugin-filesize';
import fg from 'fast-glob'
import execute from "rollup-plugin-shell";

import { name, author, license } from './package.json'

const external = [
	'react',
	'react/jsx-runtime',
	'use-sync-external-store',
	'use-sync-external-store/shim',
	'use-sync-external-store/shim/with-selector',
	'react-native'
];
const globals = {
	react: 'React',
	'react/jsx-runtime': 'ReactJsxRuntime',
}

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
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
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
	PACKAGE_NAME,
	inputs
) => {
	const OUTPUT_DIR = `${BASE_OUTPUT_DIR}dist`
	const SOURCE_INDEX_FILE = `${SOURCE_FOLDER}/index.ts`
	const { PROJECT_NAME, banner } = getProjectNameAndBanner(PACKAGE_NAME);


	/**
	 * Folders
	 */
	const CJS_DIR = `${OUTPUT_DIR}/cjs`;
	const UMD_DIR = `${OUTPUT_DIR}/umd`;
	/**
	 * Options
	 */
	const sourcemap = true;
	const umdName = PROJECT_NAME.split('-').map(capitalizeFirstLetter).join('')

	const nativeFiles = fg.sync(`${SOURCE_FOLDER}/**/*`)
		.filter((name) => name.includes('.native.'))

	const getDefault = (input) => ({
		output: {
			dir: OUTPUT_DIR,
			format: 'esm',
			sourcemap,
			banner,
			preserveModules: true
		},
		external,
		plugins: [
			{
				generateBundle (options, bundle) {
					const keys = Object.keys(bundle)
					keys.forEach((key) => {
						const obj = bundle[key];
						obj.fileName = obj.fileName.includes('src/') 
							? obj.fileName.split('src/')[1] 
							: obj.fileName
					})
					return null
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
			}),
		],
		...input
	})

	// JS modules for bundlers
	const modules = [
		getDefault({
			input: [
				SOURCE_INDEX_FILE,
				...nativeFiles
			]
		}),
		inputs ? getDefault(inputs) : undefined,
	].filter((a) => a);

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
		hook: "buildStart" 
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
			'react-fetch',
		),
		{
			input: './empty.js',
			plugins: [
				executeCommandToCreateAndFixTypes([
					{
						packageName: 'http-service',
						folderName: 'http-service',
					},
					{
						packageName: 'react-fetch',
						folderName: 'react-fetch',
					}
				])
			]
		}
	];
}
