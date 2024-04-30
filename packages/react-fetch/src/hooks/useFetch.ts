/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { useEffect, useRef } from 'react'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import { LoadingService, QueueKingSystem } from '../../../http-service/src';
import NotificationService, { type State, type UseFetchError } from '../services/NotificationService';
import { getFetchDefaultConfig } from '../utils/defaultConfig';
import { useId } from '../utils/useIdShim';

import { useIsOnline } from './useIsOnline';
import { useOnFocusFetch } from './useOnFocusFetch';
import { useRefMemo } from './useRefMemo';

export type UseBaseFetch = {
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

	const currentDataRef = useRefMemo<State<Result>>(() => {
		const { initialState } = _config;
		return {
			data: (
				typeof initialState === 'function' 
					? (initialState as () => Result)()
					: initialState
			),
			isLoading: isFetchEffect || isFetchEffectWithData,
			error: null
		}
	});

	const setLoading = (isLoading: boolean) => { 
		if ( isLoadingUsedRef.current ) {
			currentDataRef.current.isLoading = isLoading;
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
				!(e && typeof e === 'object' && (e as { name: string }).name === 'AbortError')
			) {
				currentDataRef.current.error = e;
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
