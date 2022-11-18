import { createContext, useContext } from 'react';

import { UseFetchEffectConfig } from '../hooks/useFetch';

export type FetchContextConfig = Omit<UseFetchEffectConfig, 'initialState' | 'deps' | 'scrollRestoration' | 'fetchId'>

export type FetchContextType = {
	request: Map<string, (...args: any[]) => Promise<any>>
	config?: FetchContextConfig
}

export const FetchContext = createContext<FetchContextType | undefined>(undefined);

export const useFetchContext = () => {
	return useContext(FetchContext);
}
