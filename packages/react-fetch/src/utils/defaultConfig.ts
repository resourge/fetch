import { type UseFetchStateConfig } from '../hooks';

export type FetchContextConfig = Omit<UseFetchStateConfig<any>, 'initialState' | 'deps' | 'scrollRestoration' | 'fetchId'>

const defaultConfig: FetchContextConfig = {
	useLoadingService: true,
	noEmitError: true,
	silent: true
}

export function setFetchDefaultConfig(defaultConfig: FetchContextConfig) {
	Object.entries(defaultConfig)
	.forEach(([key, value]) => {
		defaultConfig[key as keyof FetchContextConfig] = value as any;
	})
}

export function getFetchDefaultConfig() {
	return defaultConfig
}
