import { useCallback, useEffect, useRef } from 'react';

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import { LoadingService, FetchError, FetchResponseError } from '../../../http-service/src';
import { useFetchContext } from '../context/FetchContext';
import NotificationService from '../services/NotificationService';
import { useId } from '../utils/useIdShim';

import { FetchCallbackConfig, useFetchCallback } from './useFetchCallback';
import { useOnFocusFetch } from './useOnFocusFetch';

export type UseFetchResult<Data = any> = [
	data: Data, 
	fetch: () => Promise<void>,
	error: FetchResponseError | FetchError | Error,
	isLoading: boolean
] & {
	data: Data
	error: FetchResponseError | FetchError | Error
	fetch: () => Promise<void>
	isLoading: boolean
}

export type UseFetchConfig<T = any> = FetchCallbackConfig & {
	/**
	 * Default data values.
	 */
	initialState: T

	/**
	 * useEffect dependencies.
	 * Basically works on useEffect dependencies
	 * @default []
	 */
	deps?: React.DependencyList
	
	/**
	 * Errors will trigger this method.
	 * * Note: If return is undefined, it will not update error state.
	 */
	onError?: (e: null | Error | FetchError | any) => undefined | null | Error | FetchError | any
	
	/**
	 * Fetch on window focus
	 * @default true
	 */
	onWindowFocus?: boolean

	/**
	 * Serves to restore scroll position
	 */
	scrollRestoration?: ((behavior?: ScrollBehavior) => void) | Array<(behavior?: ScrollBehavior) => void>

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

type State<T = any> = {
	data: T
	error: null | Error | FetchError | any
	isLoading: boolean
}

/**
 * Hook to fetch and set data.
 * It will do the loading, error, set data, manually abort request if component is unmounted, and/or triggering other useFetch/useFetchCallback's
 * @param method - method to set fetch data
 * @param config {@link UseFetchConfig} - fetch config's. They override default HttpProvider config's.
 * @example
 * ```Typescript
  const [data, fetch, error] = useFetch(
      async () => {
          return HttpService.get("url")
      }, 
      {
          initialState: []
      }
  );
```
 */
export function useFetch<T = any>(
	method: () => Promise<T>,
	{
		initialState: defaultData, 
		deps = [], 
		useLoadingService: _useLoadingService,
		silent: _silent,
		onWindowFocus: _onWindowFocus,
		onError: _onError,
		scrollRestoration,
		...fetchConfig 
	}: UseFetchConfig
): UseFetchResult<T> {
	const httpContext = useFetchContext();

	const useLoadingService = _useLoadingService ?? httpContext?.config?.useLoadingService;
	const silent = _silent ?? httpContext?.config?.silent ?? false;
	const onWindowFocus = _onWindowFocus ?? httpContext?.config?.onWindowFocus ?? true;
	const onError = _onError ?? httpContext?.config?.onError; 

	const shouldLoadingRef = useRef<boolean>(true);
	const currentData = useRef<State<T>>({
		isLoading: true,
		data: defaultData,
		error: null
	});

	const id = useId();

	const setLoading = useLoadingService 
		? (isLoading: boolean) => {
			if ( !silent && shouldLoadingRef.current ) {
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
		: (isLoading: boolean) => {
			if ( !silent && shouldLoadingRef.current ) {
				currentData.current = {
					...currentData.current,
					isLoading
				}
				NotificationService.notifyAll();
			}
		}

	const fetchMethod = useFetchCallback(async () => {
		try {
			const data = await method();
			
			currentData.current = {
				...currentData.current,
				data
			}
		}
		catch (e) {
			if ( !(e instanceof DOMException && e.name === 'AbortError') ) {
				currentData.current = {
					...currentData.current
				}
				if ( onError ) {
					const error = onError(e);
					if ( error !== undefined ) {
						currentData.current.error = error;
						return;
					}
				}
				currentData.current.error = e;
			}
		}
		finally {
			shouldLoadingRef.current = true;
		}
	}, fetchConfig);

	const fetch = async () => {
		setLoading(true);
		NotificationService.startRequest(id);
		try {
			await fetchMethod()
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

	useOnFocusFetch(
		async () => {
			await fetchMethod();
			NotificationService.notify(id);
		},
		fetchMethod.isFetching,
		shouldLoadingRef,
		onWindowFocus
	);

	useEffect(() => {
		fetch()
		.finally(() => {
			if ( scrollRestoration ) {
				if ( Array.isArray(scrollRestoration) ) {
					scrollRestoration.forEach((method) => method());
					return;
				}
				scrollRestoration();
			}
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)

	const _isLoading = useLoadingService ? false : currentData.current.isLoading;

	const result: any = [
		currentData.current.data,
		fetch,
		currentData.current.error,
		_isLoading
	] as UseFetchResult<T>;

	result.isLoading = useLoadingService ? false : currentData.current.isLoading;
	result.data = currentData.current.data;
	result.error = currentData.current.error;
	result.fetch = fetch;

	return result
}
