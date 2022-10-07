import { createContext, useContext } from 'react';

import { UseFetchConfig } from '../hooks/useFetch';
import { FetchCallbackConfig } from '../hooks/useFetchCallback';

export type FetchTriggerValues = Array<string | { loaderId: string, params: any[] }>

export type FetchTrigger = {
	/**
	 * Triggers useFetch/useFetchCallback(by triggerId) after current fetch is done
	 */
	after?: FetchTriggerValues
	/**
	 * Triggers useFetch/useFetchCallback(by triggerId) before current fetch is done
	 */
	before?: FetchTriggerValues
}

export type FetchContextConfig = Omit<UseFetchConfig, 'initialState' | 'deps' | 'scrollRestoration' | keyof FetchCallbackConfig>

export type FetchContextType = {
	request: Map<string, {
		request: (...args: any[]) => Promise<void>
		trigger?: FetchTrigger
	}>
	config?: FetchContextConfig
}

export const FetchContext = createContext<FetchContextType | undefined>(undefined);

export const useFetchContext = () => {
	return useContext(FetchContext);
}
