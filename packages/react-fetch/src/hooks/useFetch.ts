/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { useCallback, useEffect, useRef } from 'react'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import { QueueKingSystem } from 'packages/http-service/src/index';

import { LoadingService, type FetchError, type HttpResponseError } from '../../../http-service/src'
import NotificationService from '../services/NotificationService';
import { getFetchDefaultConfig } from '../utils/defaultConfig';
import { useId } from '../utils/useIdShim';

import { useIsOnline } from './useIsOnline/useIsOnline';
import { useOnFocusFetch } from './useOnFocusFetch';

type UseFetchError = HttpResponseError | FetchError | Error | null | any

type UseBaseFetch = {
	error: UseFetchError
	/**
	 * True for when is request something
	 */
	isLoading: boolean
}

export type UseFetch<Result, T extends any[]> = UseBaseFetch & {
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: T) => Promise<Result>
};

export type UseFetchEffect<Result, T extends any[]> = UseBaseFetch & {
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: Partial<T>) => Promise<Result>
};

export type UseFetchState<Result, T extends any[]> = UseFetchEffect<Result, T> & {
	data: Result
	/**
	 * To set fetch state manually
	 */
	setFetchState: (data: Result) => void
};

export type UseFetchConfig = {	
	/**
	 * When false useEffect will not trigger fetch
	 * * Note: It is not included in the deps.
	 * @default true
	 */
	enable?: boolean

	/**
	 * Instead of triggering global LoadingService, load a specific LoadingService.
	 * @default string
	 */
	loadingService?: string
}

export type UseFetchEffectConfig = UseFetchConfig & {
	/**
	 * useEffect dependencies.
	 * Basically works on useEffect dependencies
	 * @default []
	 */
	deps?: readonly any[]
	/**
	* Fetch id
	*/
	id?: string
	/**
	* Default data values.
	*/
	initialState?: never
	/**
	* Function that executes only on useEffect finally
	*/
	onEffectEnd?: () => void
	/**
	 * Serves to restore scroll position
	 */
	scrollRestoration?: ((behavior?: ScrollBehavior) => void) | Array<(behavior?: ScrollBehavior) => void>
}

export type UseFetchStateConfig<T> = Omit<UseFetchEffectConfig, 'initialState'> & {
	/**
	* Default data values.
	*/
	initialState: T | (() => T)
	/**
	* On Data Change
	*/
	onDataChange?: (value: T) => void
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
  // Fetch with useState 
  // const {
  //	data,
  //    error,
  //    fetch,
  //    isLoading,
  //    setFetchState
  // } = useFetch(
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
  //    isLoading
  // } = useFetch(
      async (Http) => {
          return Http.get("url")
      }
  );
```
 */
type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };

export function useFetch<Result, T extends any[]>(
	method: (this: NoUndefinedField<State<Result>>, ...args: Partial<T>) => Promise<Result>,
	config: UseFetchStateConfig<Result>
): UseFetchState<Result, T>
export function useFetch<Result, T extends any[]>(
	method: (this: State<Result>, ...args: Partial<T>) => Promise<Result>,
	config: UseFetchEffectConfig
): UseFetchEffect<Result, T>
export function useFetch<Result, T extends any[]>(
	method: (this: State<Result>, ...args: T) => Promise<Result>,
	config?: UseFetchConfig
): UseFetch<Result, T> 
export function useFetch<Result, T extends any[]>(
	method: ((this: State<Result>, ...args: T) => Promise<Result>) | ((this: State<Result>, ...args: Partial<T>) => Promise<Result>),
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
	const _config: UseFetchStateConfig<Result> = (config ?? {}) as UseFetchStateConfig<Result>;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const id = _config?.id ?? useId();

	const isOnline = useIsOnline();

	const isErrorUsedRef = useRef<boolean>(false);
	const isLoadingUsedRef = useRef<boolean>(false);
	const currentData = useRef<State<Result>>({
		data: (
			typeof _config.initialState === 'function' 
				? '_function_initial_state_' 
				: _config.initialState
		) as Result,
		isLoading: isFetchEffect || isFetchEffectWithData,
		error: null
	});

	if ( 
		_config.initialState && 
		typeof _config.initialState === 'function' && 
		currentData.current.data === '_function_initial_state_' 
	) {
		currentData.current.data = (_config.initialState as () => Result)();
	}

	const setLoading = (isLoading: boolean) => { 
		if ( isLoadingUsedRef.current ) {
			currentData.current = {
				...currentData.current,
				isLoading
			}
		}
		else {
			const loadingService = _config.loadingService ?? defaultConfig.loadingService;
			// @ts-expect-error Its protected because I don't want it to be visible to others
			LoadingService.setLoading(loadingService, isLoading)
		}

		if ( !isLoading ) {
			NotificationService.notifyAll();
		}
	}

	const setFetchState = (data: Result) => {
		currentData.current = {
			...currentData.current,
			data
		}

		_config.onDataChange && _config.onDataChange(data)

		NotificationService.notify(id);
	}

	const request = async (...args: Partial<T>) => {
		const remove = QueueKingSystem.add(
			(controller) => controllers.current.add(controller),
			(controller) => controllers.current.delete(controller)
		);

		const data = await method.call(currentData.current, ...(args ?? []) as T)
		.finally(() => {
			remove();
		});

		if ( isFetchEffect && isFetchEffectWithData ) {
			currentData.current = {
				...currentData.current,
				data
			}

			_config.onDataChange && _config.onDataChange(data)
		}

		return data;
	}

	const noLoadingFetch = async (...args: Partial<T>) => {
		try {
			return await request(...(args ?? []) as T);
		}
		catch (e) {
			if ( 
				isErrorUsedRef.current &&
				!(e && typeof e === 'object' && (e as { name: string }).name === 'AbortError')
			) {
				currentData.current = {
					...currentData.current,
					error: e
				}
			}
			return await Promise.reject(e);
		}
	}

	const fetch = async (...args: T) => {
		setLoading(true);
		try {
			const prom = (NotificationService.getRequest(id) ?? noLoadingFetch(...args));

			NotificationService.startRequest(id, prom);

			return await prom;
		}
		finally {
			NotificationService.finishRequest(id);
			setLoading(false);
		}
	}

	const fetchRef = useRef<() => any>(() => {});
	fetchRef.current = () => {}

	useSyncExternalStoreWithSelector(
		useCallback((a) => NotificationService.subscribe(id, a, () => fetchRef.current()), [id]),
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

	const result: any = {
		get isLoading() {
			isLoadingUsedRef.current = true;

			return currentData.current.isLoading
		},
		get error() {
			isErrorUsedRef.current = true;

			return currentData.current.error
		},
		fetch
	};

	if ( isFetchEffect ) {
		fetchRef.current = fetch;

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if ( (_config.enable ?? defaultConfig.enable ?? true) && isOnline ) {
				QueueKingSystem.isThresholdEnabled = true;
				
				result.fetch()
				.finally(() => {
					if ( _config.scrollRestoration ) {
						if ( Array.isArray(_config.scrollRestoration) ) {
							_config.scrollRestoration.forEach((method) => {
								method(); 
							});
							return;
						}
						_config.scrollRestoration();
					}
					_config.onEffectEnd && _config.onEffectEnd();
				});
			}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isOnline, ...(_config.deps ?? [])])

		// This is to make sure onFocus will only trigger if the hook commands the data,
		// Otherwise it can lead to errors
		if ( isFetchEffectWithData ) {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			useOnFocusFetch(
				async () => {
					await (noLoadingFetch as () => Promise<any>)();
					NotificationService.notifyAll();
				},
				_config.onWindowFocus ?? defaultConfig?.onWindowFocus ?? true
			);

			result.data = currentData.current.data;
			result.setFetchState = setFetchState;
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
