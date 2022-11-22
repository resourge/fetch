/* eslint-disable @typescript-eslint/no-invalid-void-type */
import {
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import {
	LoadingService,
	FetchError,
	HttpResponseError,
	HttpService,
	HttpResponse,
	_httpService,
	HttpServiceClass
} from '../../../http-service/src'
import { useFetchContext } from '../context/FetchContext';
import NotificationService from '../services/NotificationService';
import { useId } from '../utils/useIdShim';

import { useOnFocusFetch } from './useOnFocusFetch';

type UseFetchError = HttpResponseError | FetchError | Error | null | any

type UseFetch<Result, T extends any[]> = {
	(...args: T): Promise<Result>
	error: UseFetchError
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: T) => Promise<Result>
	isLoading: boolean
	/**
	 * Fetch Method without loading
	 */
	noLoadingFetch: (...args: T) => Promise<Result>
} & [
	(...args: T) => Promise<Result>,
	UseFetchError,
	boolean
];

export type UseFetchEffect<Result, T extends any[]> = {
	(...args: Partial<T>): Promise<Result>
	error: UseFetchError
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: Partial<T>) => Promise<Result>
	isLoading: boolean
	/**
	 * Fetch Method without loading
	 */
	noLoadingFetch: (...args: Partial<T>) => Promise<Result>
} & [
	(...args: Partial<T>) => Promise<Result>,
	UseFetchError,
	boolean
];

export type UseFetchState<Result, T extends any[]> = {
	(...args: Partial<T>): Promise<Result>
	data: Result
	error: UseFetchError
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: Partial<T>) => Promise<Result>
	isLoading: boolean
	/**
	 * Fetch Method without loading
	 */
	noLoadingFetch: (...args: Partial<T>) => Promise<Result>
	/**
	 * Sets Data Manually
	 */
	setData: (data: Result) => void
} & [
	Result,
	(...args: Partial<T>) => Promise<Result>,
	UseFetchError,
	boolean,
	(data: Result) => void
];

export type UseFetchConfig = {	
	/**
	 * Serves as an uniqueId to be able to trigger in other fetch calls
	 */
	fetchId?: string
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

export type UseFetchEffectConfig = UseFetchConfig & {
	/**
	 * useEffect dependencies.
	 * Basically works on useEffect dependencies
	 * @default []
	 */
	deps?: React.DependencyList
	/**
	 * Serves to restore scroll position
	 */
	scrollRestoration?: ((behavior?: ScrollBehavior) => void) | Array<(behavior?: ScrollBehavior) => void>
}

export type UseFetchStateConfig<T = any> = UseFetchEffectConfig & {
	/**
	* Default data values.
	*/
	initialState?: T
	/**
	 * Fetch on window focus
	 * @default true when initialState is defined.
	 */
	onWindowFocus?: boolean
}

type State<T> = {
	data: T | undefined
	error: UseFetchError
	isLoading: boolean
}

/**
 * Hook to fetch and set data.
 * It will do the loading, error, set data, manually abort request if component is unmounted, and/or triggering other useFetch/useFetchCallback's
 * * Note: When initialState is set, it will also trigger an useEffect, otherwise it's just a method
 * @param method - method to set fetch data
 * @param config {@link UseFetchConfig} - fetch config's. They override default HttpProvider config's.
 * @example
 * ```Typescript
  // Fetch with useEffect 
  // const {
  //	data,
  //    error,
  //    fetch,
  //    isLoading,
  //    noLoadingFetch,
  //    setData
  // } = useFetch(
  // or 
  const [data, fetch, error, isLoading] = useFetch(
      async (Http) => {
          return Http.get("url")
      }, 
      {
          initialState: []
      }
  );
  // Fetch without useEffect 
  // const {
  //    error,
  //    fetch,
  //    isLoading,
  //    noLoadingFetch
  // } = useFetch(
  // or 
  const [fetch, error, isLoading] = useFetch(
      async (Http) => {
          return Http.get("url")
      }
  );
```
 */

export function useFetch<Result, T extends any[]>(
	method: (Http: typeof HttpService, ...args: T) => Promise<Result>,
	config?: UseFetchConfig
): UseFetch<Result, T> 
export function useFetch<Result, T extends any[]>(
	method: (Http: typeof HttpService, ...args: Partial<T>) => Promise<Result>,
	config: UseFetchEffectConfig
): UseFetchEffect<Result, T>
export function useFetch<Result, T extends any[]>(
	method: (Http: typeof HttpService, ...args: Partial<T>) => Promise<Result>,
	config: UseFetchStateConfig
): UseFetchState<Result, T>
export function useFetch<Result, T extends any[]>(
	method: ((Http: typeof HttpService, ...args: T) => Promise<Result>) | 
	((Http: typeof HttpService, ...args: Partial<T>) => Promise<Result>),
	config?: UseFetchConfig | UseFetchEffectConfig | UseFetchStateConfig
): UseFetch<Result, T> | UseFetchEffect<Result, T> | UseFetchState<Result, T> {
	const httpContext = useFetchContext();

	const controllers = useRef<Map<string, AbortController>>(new Map())

	const [_HttpService] = useState<typeof HttpService>(() => {
		const _HttpServiceClass = httpContext?.HttpServiceClass ?? HttpServiceClass;

		const Http: typeof HttpService = _HttpServiceClass.clone((httpContext?.HttpService ?? _httpService));
		
		Http.interceptors.request.values.unshift({
			onRequest: (config) => {
				if ( !config.signal ) {
					const url = (config.url as URL).href;
					const controller = new AbortController();

					controllers.current.set(url, controller)

					config.signal = controller.signal;
				}
				return config;
			}
		});

		Http.interceptors.response.values.unshift({
			onResponse: (response: HttpResponse<any>) => {
				const config = response.request;
				if ( config.signal ) {
					const url = config.url;

					controllers.current.delete(url);
				}
				return response;
			}
		});

		return Http;
	});

	let isFetchEffect = false;
	let isFetchEffectWithData = false;
	if ( config ) {
		const keys = Object.keys(config) as Array<keyof UseFetchStateConfig>;
		
		isFetchEffect = keys.some((key) => key === 'initialState' || key === 'deps');
		
		isFetchEffectWithData = keys.includes('initialState');
	}

	const deps = (config as UseFetchEffectConfig)?.deps ?? [];
	const onWindowFocus = (config as UseFetchStateConfig)?.onWindowFocus ?? httpContext?.config?.onWindowFocus ?? true;
	const scrollRestoration = (config as UseFetchEffectConfig)?.scrollRestoration;
	const useLoadingService = config?.useLoadingService ?? httpContext?.config?.useLoadingService;
	const silent = config?.silent ?? httpContext?.config?.silent ?? false;
	const noEmitError = config?.noEmitError ?? httpContext?.config?.noEmitError; 

	const currentData = useRef<State<Result>>({
		data: (config as UseFetchStateConfig)?.initialState,
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

	const request = isFetchEffect 
		? async (...args: Partial<T>) => {
			const data = await method(_HttpService, ...(args ?? []) as T);

			if ( isFetchEffectWithData ) {
				currentData.current = {
					...currentData.current,
					data
				}
			}

			return data;
		} : (...args: T): Promise<Result> => {
			return method(_HttpService, ...args);
		}

	const noLoadingFetch = async (...args: Partial<T>) => {
		try {
			return await request(...(args ?? []) as T);
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
	}

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
				if (
					(
						isFetchEffect && (
							i === 5
						)
					) || (
						!isFetchEffect && (
							i === 3
						)
					)
				) {
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

	result.isLoading = _isLoading;
	result.error = currentData.current.error;
	result.fetch = fetch;
	result.noLoadingFetch = noLoadingFetch;

	result[0] = fetch;
	result[1] = currentData.current.error;
	result[2] = _isLoading;

	if ( isFetchEffect ) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			_HttpService.defaultConfig.isThresholdEnabled = true;
			result()
			.finally(() => {
				_HttpService.defaultConfig.isThresholdEnabled = false;
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

		// This is to make sure onFocus will only trigger if the hook commands the data,
		// Otherwise it can lead to errors
		if ( isFetchEffectWithData ) {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			useOnFocusFetch(
				async () => {
					await result.noLoadingFetch();
					NotificationService.notify(id);
				},
				onWindowFocus
			);

			result.data = currentData.current.data;
			result.setData = setData;
			result[0] = currentData.current.data;
			result[1] = fetch;
			result[2] = currentData.current.error;
			result[3] = _isLoading;
			result[4] = setData;
		}
	}

	useEffect(() => {
		if ( config?.fetchId && httpContext ) {
			const fetchId = config?.fetchId;
			httpContext.request.set(fetchId, fetch as (...args: any[]) => Promise<any>);
		}
	})

	useEffect(() => {
		return () => {
			if ( config?.fetchId && httpContext ) {
				httpContext.request.delete(config?.fetchId)
			}
			if ( controllers.current.size ) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				controllers.current.forEach((controller) => {
					if ( !controller.signal.aborted ) {
						controller.abort();
					}
				})
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return result
}
