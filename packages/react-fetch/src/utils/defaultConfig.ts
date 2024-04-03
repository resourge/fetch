import { type UseFetchStateConfig } from '../hooks';

export type FetchContextConfig = Pick<
	UseFetchStateConfig<any>, 
	'loadingService'
	| 'onWindowFocus'
	| 'enable'
>

const defaultConfig: FetchContextConfig = {}

export function setFetchDefaultConfig(newDefaultConfig: FetchContextConfig) {
	Object.entries(newDefaultConfig)
	.forEach(([key, value]) => {
		defaultConfig[key as keyof FetchContextConfig] = value as any;
	})
}

export function getFetchDefaultConfig() {
	return defaultConfig
}
