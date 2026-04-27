import reactConfig from 'eslint-config-resourge/react';
import { defineConfig } from 'eslint/config';

reactConfig.at(-1)?.files?.push('**/src/**/*.{js,ts,tsx}');

export default defineConfig(reactConfig);
