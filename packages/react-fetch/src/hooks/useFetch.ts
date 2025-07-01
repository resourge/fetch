/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { useEffect, useRef } from 'react'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import { LoadingService, QueueKingSystem, isAbortedError } from '../../../http-service/src';
import NotificationService, { type State, type UseFetchError } from '../services/NotificationService';
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
	config: FetchConfig | FetchEffectConfig | FetchStateConfig<Result> = {}
): FetchMethod<Result, T> | FetchEffect<Result, T> | FetchState<Result, T> {
	const controllers = useRef<Set<AbortController>>(new Set())
	const isErrorUsedRef = useRef<boolean>(false);
	const isLoadingUsedRef = useRef<boolean>(false);
	const fetchRef = useRef<() => any>(() => {});

	const isOnline = useIsOnline();

	const isFetchEffectWithData = 'initialState' in config;
	const isFetchEffect = isFetchEffectWithData || 'deps' in config;

	const _config: FetchStateConfig<Result> = config as FetchStateConfig<Result>;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { id = useId(), initialState } = _config;

	const currentDataRef = useRefMemo<State<Result>>(() => ({
		data: (
			typeof initialState === 'function' 
				? (initialState as () => Result)()
				: initialState
		),
		isLoading: _config.enable !== false && 
		!_config.silent &&
		(isFetchEffect || isFetchEffectWithData),
		error: null
	}));

	const setLoading = (isLoading: boolean) => { 
		if ( !_config.silent ) {
			if ( isLoadingUsedRef.current ) {
				const shouldUpdate = isLoading && currentDataRef.current.isLoading !== isLoading
				
				currentDataRef.current.isLoading = isLoading;
				
				if ( shouldUpdate ) {
					NotificationService.notifyById(id);
				}
			}
			else {
				// @ts-expect-error Its protected because I don't want it to be visible to others
				LoadingService.setLoading(_config.loadingService, isLoading)
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

	const noLoadingFetch = async (...args: Partial<T>) => {
		try {
			const prom = (
				NotificationService.getRequest(id) ?? (
					(() => {
						const remove = QueueKingSystem.add(
							(controller) => controllers.current.add(controller),
							(controller) => controllers.current.delete(controller)
						);
						
						return method
						.call(currentDataRef.current, ...(args ?? []) as T)
						.finally(() => {
							remove();
						})
					})()
				)
			);

			NotificationService.startRequest(id, prom);

			const data = await prom

			if ( isFetchEffect && isFetchEffectWithData ) {
				currentDataRef.current.data = data;

				_config.onDataChange && _config.onDataChange(data)
			}

			return data;
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
		finally {
			NotificationService.finishRequest(id);
		}
	}

	const fetch = async (...args: T) => {
		if ( !isOnline ) {
			return await Promise.reject(new Error('No internet'))
		}
		if ( isErrorUsedRef.current && currentDataRef.current.error ) {
			currentDataRef.current.error = null;
		}
		setLoading(true);
		try {
			return await noLoadingFetch(...args);
		}
		finally {
			setLoading(false);
		}
	}

	const { 
		current: {
			subscribe,
			getSnapshot,
			selector,
			isEqual
		} 
	} = useRefMemo(() => ({
		subscribe: NotificationService.subscribe(id, () => fetchRef.current()),
		getSnapshot: () => ({
			data: currentDataRef.current.data,
			isLoading: currentDataRef.current.isLoading,
			error: currentDataRef.current.error
		}),
		selector: (selection: State<Result>) => selection,
		isEqual: (previousState: State<Result>, newState: State<Result>) => (
			previousState.isLoading === newState.isLoading &&
			previousState.data === newState.data &&
			previousState.error === newState.error
		)
	}));

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

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if ( _config.enable !== false && isOnline ) {
				QueueKingSystem.isThresholdEnabled = true;
				
				result.fetch()
				.finally(() => {
					if ( _config.scrollRestoration ) {
						(
							Array.isArray(_config.scrollRestoration) 
								? _config.scrollRestoration 
								: [_config.scrollRestoration]
						)
						.forEach((method) => {
							method?.(); 
						});
					}
					_config.onEffectEnd?.();
				});
			}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isOnline, _config.enable, ...(_config.deps ?? [])])

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
				_config.enable !== false ? (_config.onWindowFocus ?? true) : false
			);

			result.data = currentDataRef.current.data;
			result.setFetchState = setFetchState;
		}
	}

	useEffect(() => {
		return () => {
			NotificationService.finishRequest(id); 
			if ( controllers.current.size ) {
				controllers.current
				.forEach((controller) => {
					controller.abort();
				})
				// eslint-disable-next-line react-hooks/exhaustive-deps
				controllers.current.clear();
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return result
}
