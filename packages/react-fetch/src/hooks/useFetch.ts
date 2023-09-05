/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { useCallback, useEffect, useRef } from 'react'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import { QueueKingSystem } from 'packages/http-service/src/index';

import { LoadingService, type FetchError, type HttpResponseError } from '../../../http-service/src'
import NotificationService from '../services/NotificationService';
import { getFetchDefaultConfig } from '../utils/defaultConfig';
import { useId } from '../utils/useIdShim';

import { useOnFocusFetch } from './useOnFocusFetch';

type UseFetchError = HttpResponseError | FetchError | Error | null | any

export type UseFetch<Result, T extends any[]> = {
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
	 * When false useEffect will not trigger fetch
	 * * Note: It is not included in the deps.
	 * @default true
	 */
	enable?: boolean
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
	deps?: readonly any[]
	/**
	* Default data values.
	*/
	initialState?: never
	/**
	 * Trigger when deps change
	 */
	onDepsChange?: () => void
	/**
	 * Serves to restore scroll position
	 */
	scrollRestoration?: ((behavior?: ScrollBehavior) => void) | Array<(behavior?: ScrollBehavior) => void>
}

export type UseFetchStateConfig<T> = Omit<UseFetchEffectConfig, 'initialState'> & {
	/**
	* Default data values.
	*/
	initialState: T
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
	method: (...args: Partial<T>) => Promise<Result>,
	config: UseFetchStateConfig<Result>
): UseFetchState<Result, T>
export function useFetch<Result, T extends any[]>(
	method: (...args: Partial<T>) => Promise<Result>,
	config: UseFetchEffectConfig
): UseFetchEffect<Result, T>
export function useFetch<Result, T extends any[]>(
	method: (...args: T) => Promise<Result>,
	config?: UseFetchConfig
): UseFetch<Result, T> 
export function useFetch<Result, T extends any[]>(
	method: ((...args: T) => Promise<Result>) | ((...args: Partial<T>) => Promise<Result>),
	config?: UseFetchConfig | UseFetchEffectConfig | UseFetchStateConfig<Result>
): UseFetch<Result, T> | UseFetchEffect<Result, T> | UseFetchState<Result, T> {
	const controllers = useRef<Set<AbortController>>(new Set())

	let isFetchEffect = false;
	let isFetchEffectWithData = false;
	if ( config ) {
		const keys = Object.keys(config) as Array<keyof UseFetchStateConfig<Result>>;
		
		isFetchEffect = keys.some((key) => key === 'initialState' || key === 'deps');
		
		isFetchEffectWithData = keys.includes('initialState');
	}

	const defaultConfig = getFetchDefaultConfig()

	const deps = (config as UseFetchEffectConfig)?.deps ?? [];
	const onWindowFocus = (config as UseFetchStateConfig<Result>)?.onWindowFocus ?? defaultConfig?.onWindowFocus ?? true;
	const scrollRestoration = (config as UseFetchEffectConfig)?.scrollRestoration;
	const useLoadingService = config?.useLoadingService ?? defaultConfig.useLoadingService;
	const silent = config?.silent ?? defaultConfig.silent ?? false;
	const noEmitError = config?.noEmitError ?? defaultConfig.noEmitError; 
	const enable = config?.enable ?? defaultConfig.enable ?? true; 

	const currentData = useRef<State<Result>>({
		data: (config as UseFetchStateConfig<Result>)?.initialState,
		isLoading: isFetchEffect || isFetchEffectWithData,
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

	const controllerSystem = () => {
		return QueueKingSystem.add(
			(controller) => {
				controllers.current.add(controller)
			},
			(controller) => {
				controllers.current.delete(controller)
			}
		)
	}

	const request = isFetchEffect 
		? async (...args: Partial<T>) => {
			const remove = controllerSystem();

			const data = await method(...(args ?? []) as T)
			.finally(() => {
				remove();
			});

			if ( isFetchEffectWithData ) {
				currentData.current = {
					...currentData.current,
					data
				}
			}

			return data;
		} : (...args: T): Promise<Result> => {
			const remove = controllerSystem();

			return method(...args).finally(() => {
				remove()
			});
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
			if ( enable ) {
				QueueKingSystem.isThresholdEnabled = true;

				const _config = (config as UseFetchEffectConfig);
				_config.onDepsChange && _config.onDepsChange();
				
				result()
				.finally(() => {
					if ( scrollRestoration ) {
						if ( Array.isArray(scrollRestoration) ) {
							scrollRestoration.forEach((method) => {
								method(); 
							});
							return;
						}
						scrollRestoration();
					}
				});
			}
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
		return () => {
			if ( controllers.current.size ) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				controllers.current.forEach((controller) => {
					if ( !controller.signal.aborted ) {
						controller.abort();
					}
				})
				controllers.current = new Set();
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return result
}
