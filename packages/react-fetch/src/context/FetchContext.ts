import { createContext, useContext } from 'react';

import { HttpService } from 'packages/http-service/src';

import { UseFetchStateConfig } from '../hooks/useFetch';

export type FetchContextConfig = Omit<UseFetchStateConfig, 'initialState' | 'deps' | 'scrollRestoration' | 'fetchId'>

export type FetchContextType = {
	HttpService: typeof HttpService
	request: Map<string, (...args: any[]) => Promise<any>>
	config?: FetchContextConfig
	HttpServiceClass?: {
		new(): typeof HttpService
		clone: (http: typeof HttpService) => typeof HttpService
	}
}

export const FetchContext = createContext<FetchContextType | undefined>(undefined);

export const useFetchContext = () => {
	return useContext(FetchContext);
}
