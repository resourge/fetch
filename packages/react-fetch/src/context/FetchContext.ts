import { createContext, useContext } from 'react';

import { type BaseHttpService } from 'packages/http-service/src';

import { type UseFetchStateConfig } from '../hooks/useFetch';

export type FetchContextConfig = Omit<UseFetchStateConfig<any>, 'initialState' | 'deps' | 'scrollRestoration' | 'fetchId'>

export type FetchContextType = {
	HttpService: BaseHttpService
	request: Map<string, (...args: any[]) => Promise<any>>
	config?: FetchContextConfig
}

export const FetchContext = createContext<FetchContextType | undefined>(undefined);

export const useFetchContext = () => {
	return useContext(FetchContext);
}
