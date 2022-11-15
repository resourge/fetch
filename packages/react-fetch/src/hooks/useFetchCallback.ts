import { useCallback, useRef } from 'react';

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import { LoadingService, FetchError, HttpResponseError } from '../../../http-service/src'
import { useFetchContext } from '../context/FetchContext';
import NotificationService from '../services/NotificationService';
import { useId } from '../utils/useIdShim';

import { ControlledFetchConfig, useControlledFetch } from './useControlledFetch';

export interface UseFetchCallbackValue<T extends any[], Result = any> {
	(...args: T): Promise<Result>
	data: Result
	error: HttpResponseError | FetchError | Error
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: T) => Promise<Result>
	isLoading: boolean
	/**
	 * Fetch Method without loading
	 */
	noLoadingFetch: (...args: T) => Promise<Result>
	/**
	 * Sets Data Manually
	 */
	setData: (data: Result) => void
}

export type UseFetchCallbackResult<T extends any[], Result = any> = UseFetchCallbackValue<T, Result> 
& [
	(...args: T) => Promise<Result>,
	boolean,
	HttpResponseError | FetchError | Error,
	Result,
	(data: Result) => void
]

export type UseFetchCallbackConfig<T> = ControlledFetchConfig & {	
	/**
	* Default data values.
	*/
	initialState?: T

	/**
	 * When false makes it so no error is emitted
	 * @default false
	 */
	noEmitError?: boolean

	/**
	 * Doesn't trigger any Loading
	 * @default false
	 */
	silent?: boolean

	/**
	 * Instead of triggering a local loading, this make it so LoadingService does it.
	 * When:
	 * 	[true] - Will trigger GlobalLoading loading;
	 *  [string] - Will trigger loaderId Loading ("<Loader loaderId="">") 
	 *  [string[]] - Will trigger all loaderId Loading ("<Loader loaderId="">") 
	 * @default undefined
	 */
	useLoadingService?: boolean | string | string[]
}

type State<T> = {
	data: T | undefined
	error: null | Error | FetchError | any
	isLoading: boolean
}

/**
 * Hook to fetch and control loading.
 * It will do the loading, error, set data, manually abort request if component is unmounted, and/or triggering other useFetch/useFetchCallback's
 * * Note: It will not trigger on useEffect, for that use `useFetch`.
 * @param method - method to set fetch data
 * @param config {@link UseFetchCallbackConfig} - fetch config's. They override default HttpProvider config's.
 * @example
 * ```Typescript
  const getUrl = useFetchCallback(
    async () => {
      return HttpService.get("url")
    }
  );
```
 */
export function useFetchCallback<T extends any[], Result = any>(
	method: (...args: T) => Promise<Result>,
	config?: UseFetchCallbackConfig<Result>
): UseFetchCallbackResult<T, Result> {
	const httpContext = useFetchContext();

	const useLoadingService = config?.useLoadingService ?? httpContext?.config?.useLoadingService;
	const silent = config?.silent ?? httpContext?.config?.silent ?? false;
	const noEmitError = config?.noEmitError ?? httpContext?.config?.noEmitError; 

	const currentData = useRef<State<Result>>({
		data: config?.initialState,
		isLoading: true,
		error: null
	});

	const id = useId();

	const setLoading = (isLoading: boolean) => { 
		if ( useLoadingService ) {
			if ( !silent ) {
				if ( Array.isArray(useLoadingService) ) {
					useLoadingService.forEach((name) => {
						// @ts-expect-error Its protected because I don't want it to be visible to others
						LoadingService.setLoading(name, isLoading);
					})
	
					return;
				}
				// @ts-expect-error Its protected because I don't want it to be visible to others
				LoadingService.setLoading(typeof useLoadingService === 'string' ? useLoadingService : '', isLoading)
			}
			if ( !isLoading ) {
				NotificationService.notifyAll();
			}
		}
		else {
			if ( !silent ) {
				currentData.current = {
					...currentData.current,
					isLoading
				}
				NotificationService.notifyAll();
			}
		}
	}

	const setData = (data: Result) => {
		currentData.current = {
			...currentData.current,
			data
		}

		NotificationService.notify(id);
	}

	const noLoadingFetch = useControlledFetch<T, Result>(async (...args: T): Promise<Result> => {
		try {
			const data = await method(...args);
			currentData.current = {
				...currentData.current,
				data
			}

			return data;
		}
		catch (e) {
			if ( !(e instanceof DOMException && e.name === 'AbortError') ) {
				currentData.current = {
					...currentData.current
				}
				if ( !noEmitError ) {
					currentData.current.error = e;
				}
			}
			return await Promise.reject(e);
		}
	}, {
		fetchId: config?.fetchId,
		trigger: config?.trigger,
		abort: config?.abort
	});

	const fetch = async (...args: T) => {
		setLoading(true);
		NotificationService.startRequest(id);
		try {
			return await noLoadingFetch(...args);
		}
		finally {
			NotificationService.finishRequest(id);
			setLoading(false);
		}
	}

	useSyncExternalStoreWithSelector(
		useCallback((a) => NotificationService.subscribe(id, a), [id]),
		() => currentData.current,
		() => currentData.current,
		(selection) => selection,
		(previousState, newState) => {
			return (
				`${String(previousState.isLoading)}` === `${String(newState.isLoading)}` &&
				previousState.data === newState.data &&
				previousState.error === newState.error
			)
		}
	);

	const _isLoading = useLoadingService ? false : currentData.current.isLoading;

	const result: any = fetch;

	result[Symbol.iterator] = function () {
		let i = 0;
		return {
			next() {
				const value = result[i++]
				if (value === undefined) {
					return {
						done: true,
						value 
					};
				}
				return {
					done: false,
					value 
				};
			}
		};
	}

	result[0] = fetch;
	result[1] = _isLoading;
	result[2] = currentData.current.error;
	result[3] = currentData.current.data;
	result[4] = setData;

	result.isLoading = useLoadingService ? false : currentData.current.isLoading;
	result.error = currentData.current.error;
	result.fetch = fetch;
	result.data = currentData.current.data;
	result.setData = setData;

	result.noLoadingFetch = noLoadingFetch;

	return result
}
