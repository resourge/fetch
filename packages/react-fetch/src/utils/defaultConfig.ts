import { type UseFetchStateConfig } from '../hooks';

export type FetchContextConfig = Omit<UseFetchStateConfig<any>, 'initialState' | 'deps' | 'scrollRestoration' | 'fetchId'>

const defaultConfig: FetchContextConfig = {
	useLoadingService: true,
	noEmitError: true
}

export function setFetchDefaultConfig(newDefaultConfig: FetchContextConfig) {
	Object.entries(newDefaultConfig)
	.forEach(([key, value]) => {
		defaultConfig[key as keyof FetchContextConfig] = value as any;
	})
}

export function getFetchDefaultConfig() {
	return defaultConfig
}
