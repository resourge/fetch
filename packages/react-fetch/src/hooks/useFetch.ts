/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { useEffect, useRef } from 'react'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import { LoadingService, QueueKingSystem, isAbortedError } from '../../../http-service/src';
import NotificationService, { type State, type UseFetchError } from '../services/NotificationService';
import { getFetchDefaultConfig } from '../utils/defaultConfig';
import { useId } from '../utils/useIdShim';

import { useIsOnline } from './useIsOnline';
import { useOnFocusFetch } from './useOnFocusFetch';
import { useRefMemo } from './useRefMemo';

export type BaseFetch = {
	error: UseFetchError
	/**
	 * True for when is request something
	 */
	isLoading: boolean
}

export type FetchMethod<Result, T extends any[]> = BaseFetch & {
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: T) => Promise<Result>
};

export type FetchEffect<Result, T extends any[]> = BaseFetch & {
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: Partial<T>) => Promise<Result>
};

export type FetchState<Result, T extends any[]> = FetchEffect<Result, T> & {
	data: Result
	/**
	 * To set fetch state manually
	 */
	setFetchState: (data: Result) => void
};

export type FetchConfig = {	
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
	/**
	 * Doesn't trigger any Loading
	 * @default false
	 */
	silent?: boolean
}

export type FetchEffectConfig = FetchConfig & {
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

export type FetchStateConfig<T> = Omit<FetchEffectConfig, 'initialState'> & {
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

/**
 * Hook to fetch and set data.
 * It will do the loading, error, set data, manually abort request if component is unmounted, and/or triggering other useFetch/useFetchCallback's
 * * Note: When initialState is set, it will also trigger an useEffect, otherwise it's just a method
 * @param method - method to set fetch data
 * @param config {@link FetchConfig} - fetch config's. They override default HttpProvider config's.
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
	config: FetchStateConfig<Result>
): FetchState<Result, T>
export function useFetch<Result, T extends any[]>(
	method: (this: State<Result>, ...args: Partial<T>) => Promise<Result>,
	config: FetchEffectConfig
): FetchEffect<Result, T>
export function useFetch<Result, T extends any[]>(
	method: (this: State<Result>, ...args: T) => Promise<Result>,
	config?: FetchConfig
): FetchMethod<Result, T> 
export function useFetch<Result, T extends any[]>(
	method: ((this: State<Result>, ...args: T) => Promise<Result>) | ((this: State<Result>, ...args: Partial<T>) => Promise<Result>),
	config?: FetchConfig | FetchEffectConfig | FetchStateConfig<Result>
): FetchMethod<Result, T> | FetchEffect<Result, T> | FetchState<Result, T> {
	const controllers = useRef<Set<AbortController>>(new Set())

	let isFetchEffect = false;
	let isFetchEffectWithData = false;
	if ( config ) {
		const keys = Object.keys(config) as Array<keyof FetchStateConfig<Result>>;
		
		isFetchEffect = keys.some((key) => key === 'initialState' || key === 'deps');
		
		isFetchEffectWithData = keys.includes('initialState');
	}

	const defaultConfig = getFetchDefaultConfig()
	const _config: FetchStateConfig<Result> = (config ?? {}) as FetchStateConfig<Result>;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const id = _config.id ?? useId();

	const isOnline = useIsOnline();

	const isErrorUsedRef = useRef<boolean>(false);
	const isLoadingUsedRef = useRef<boolean>(false);

	const currentDataRef = useRefMemo<State<Result>>(() => {
		const { initialState } = _config;
		const enable = (_config.enable ?? defaultConfig.enable ?? true);
		const silent = _config.silent ?? false;

		return {
			data: (
				typeof initialState === 'function' 
					? (initialState as () => Result)()
					: initialState
			),
			isLoading: !enable || silent ? false : (isFetchEffect || isFetchEffectWithData),
			error: null
		}
	});

	const setLoading = (isLoading: boolean) => { 
		if ( !_config.silent ) {
			if ( isLoadingUsedRef.current ) {
				currentDataRef.current.isLoading = isLoading;
			}
			else {
				const loadingService = _config.loadingService ?? defaultConfig.loadingService;
				// @ts-expect-error Its protected because I don't want it to be visible to others
				LoadingService.setLoading(loadingService, isLoading)
			}
		}

		if ( !isLoading ) {
			NotificationService.notifyAll();
		}
	}

	const setFetchState = (data: Result) => {
		currentDataRef.current.data = data;

		_config.onDataChange && _config.onDataChange(data)

		NotificationService.notifyAll();
	}

	const request = async (...args: Partial<T>) => {
		const remove = QueueKingSystem.add(
			(controller) => controllers.current.add(controller),
			(controller) => controllers.current.delete(controller)
		);

		const data = await method.call(currentDataRef.current, ...(args ?? []) as T)
		.finally(() => {
			remove();
		})

		if ( isFetchEffect && isFetchEffectWithData ) {
			currentDataRef.current.data = data;

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
				!isAbortedError(e)
			) {
				currentDataRef.current.error = e;
			}
			return await Promise.reject(e);
		}
	}

	const fetch = async (...args: T) => {
		if ( isErrorUsedRef.current && currentDataRef.current.error ) {
			currentDataRef.current.error = null;
		}
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

	const { 
		current: {
			subscribe,
			getSnapshot,
			selector,
			isEqual
		} 
	} = useRefMemo(() => {
		const subscribe = NotificationService.subscribe(id, () => fetchRef.current());
		const getSnapshot = () => ({
			data: currentDataRef.current.data,
			isLoading: currentDataRef.current.isLoading,
			error: currentDataRef.current.error
		});
		const selector = (selection: State<Result>) => selection
		const isEqual = (previousState: State<Result>, newState: State<Result>) => {
			return (
				`${String(previousState.isLoading)}` === `${String(newState.isLoading)}` &&
				previousState.data === newState.data &&
				previousState.error === newState.error
			)
		};

		return {
			subscribe,
			getSnapshot,
			selector,
			isEqual
		}
	});

	useSyncExternalStoreWithSelector(
		subscribe,
		getSnapshot,
		getSnapshot,
		selector,
		isEqual
	);

	const result: any = {
		get isLoading() {
			isLoadingUsedRef.current = true;

			return currentDataRef.current.isLoading
		},
		get error() {
			isErrorUsedRef.current = true;

			return currentDataRef.current.error
		},
		fetch
	};

	if ( isFetchEffect ) {
		fetchRef.current = fetch;

		const enable = (_config.enable ?? defaultConfig.enable ?? true);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if ( enable && isOnline ) {
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
		}, [isOnline, enable, ...(_config.deps ?? [])])

		// This is to make sure onFocus will only trigger if the hook commands the data,
		// Otherwise it can lead to errors
		if ( isFetchEffectWithData ) {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			useOnFocusFetch(
				async () => {
					if ( isErrorUsedRef.current && currentDataRef.current.error ) {
						currentDataRef.current.error = null;
						NotificationService.notifyById(id);
					}
					await (noLoadingFetch as () => Promise<any>)();
					NotificationService.notifyAll();
				},
				_config.onWindowFocus ?? defaultConfig?.onWindowFocus ?? true
			);

			result.data = currentDataRef.current.data;
			result.setFetchState = setFetchState;
		}
	}

	useEffect(() => {
		return () => {
			NotificationService.finishRequest(id); 
			if ( controllers.current.size ) {
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
