/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
	define: {
		__DEV__: true
	},
	plugins: [
		react(),
		checker({
			enableBuild: true,
			eslint: {
				lintCommand: 'eslint "./**/src/**/*.{ts,tsx}"'
			},
			overlay: {
				initialIsOpen: false
			},
			typescript: true
		})
	],	
	resolve: {
		tsconfigPaths: true
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './src/setupTests.ts'
	}
});
