/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { useEffect, useRef } from 'react'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

import {
	LoadingService,
	QueueKingSystem,
	isAbortedError,
	PromiseAllGrowing
} from '../../../http-service/src'
import NotificationService, { type State, type UseFetchError } from '../services/NotificationService';
import { useId } from '../utils/useIdShim';

import { useEffectEvent } from './useEffectEvent';
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

export type FetchMethod<Result, A extends any[]> = BaseFetch & {
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: A) => Promise<Result>
};

export type FetchEffect<Result, A extends any[]> = BaseFetch & {
	/**
	 * Fetch Method with loading
	 */
	fetch: (...args: Partial<A>) => Promise<Result>
};

export type FetchState<Result, A extends any[]> = FetchEffect<Result, A> & {
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

export type FetchStateConfig<A> = Omit<FetchEffectConfig, 'initialState'> & {
	/**
	* Default data values.
	*/
	initialState: A | (() => A)
	/**
	* On Data Change
	*/
	onDataChange?: (value: A) => void
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
type NoUndefinedField<A> = { [P in keyof A]-?: NoUndefinedField<NonNullable<A[P]>> };

const FetchPromises = new PromiseAllGrowing()

export function useFetch<Result, A extends any[]>(
	method: (this: NoUndefinedField<State<Result>>, ...args: Partial<A>) => Promise<Result>,
	config: FetchStateConfig<Result>
): FetchState<Result, A>
export function useFetch<Result, A extends any[]>(
	method: (this: State<Result>, ...args: Partial<A>) => Promise<Result>,
	config: FetchEffectConfig
): FetchEffect<Result, A>
export function useFetch<Result, A extends any[]>(
	method: (this: State<Result>, ...args: A) => Promise<Result>,
	config?: FetchConfig
): FetchMethod<Result, A> 
export function useFetch<Result, A extends any[]>(
	method: ((this: State<Result>, ...args: A) => Promise<Result>) | ((this: State<Result>, ...args: Partial<A>) => Promise<Result>),
	config: FetchConfig | FetchEffectConfig | FetchStateConfig<Result> = {}
): FetchMethod<Result, A> | FetchEffect<Result, A> | FetchState<Result, A> {
	const controllers = useRef<Set<AbortController>>(new Set())
	const isUsedRef = useRef<{
		data: boolean
		error: boolean
		loading: boolean
	}>({
		data: false,
		error: false,
		loading: false
	});

	const isOnline = useIsOnline();

	const isFetchEffectWithData = 'initialState' in config;
	const isFetchEffect = isFetchEffectWithData || 'deps' in config;

	const _config: FetchStateConfig<Result> = config as FetchStateConfig<Result>;

	const id = useId();
	const onDataChange = useEffectEvent(_config.onDataChange);

	const currentDataRef = useRefMemo<State<Result>>(() => ({
		data: (
			typeof _config.initialState === 'function' 
				? (_config.initialState as () => Result)()
				: _config.initialState
		),
		isLoading: _config.enable !== false && 
		!_config.silent &&
		(isFetchEffect || isFetchEffectWithData),
		error: null
	}));

	const setLoading = (isLoading: boolean) => { 
		if ( !_config.silent ) {
			if ( isUsedRef.current.loading ) {
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

	const noLoadingFetch = async (...args: Partial<A>) => {
		try {
			const data = await FetchPromises.promise(args.length ? 'fetch' : 'useEffect', () => {
				const remove = QueueKingSystem.add(
					(controller) => controllers.current.add(controller),
					(controller) => controllers.current.delete(controller)
				);
				NotificationService.startRequest(id);
						
				return method
				.apply(currentDataRef.current, (args ?? []) as A)
				.finally(remove)
			})

			if ( isFetchEffectWithData ) {
				currentDataRef.current.data = data;

				_config.onDataChange && _config.onDataChange(data); 
			}

			return data;
		}
		catch (e) {
			if ( 
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

	const { 
		current: {
			subscribe,
			getSnapshot,
			selector,
			isEqual
		} 
	} = useRefMemo(() => ({
		subscribe: NotificationService.subscribe(id),
		getSnapshot: () => ({
			data: currentDataRef.current.data,
			isLoading: currentDataRef.current.isLoading,
			error: currentDataRef.current.error
		}),
		selector: (selection: State<Result>) => selection,
		isEqual: (previousState: State<Result>, newState: State<Result>) => (
			previousState.isLoading === newState.isLoading &&
			(
				!isUsedRef.current.data ||
				previousState.data === newState.data
			) && (
				!isUsedRef.current.error ||
				previousState.error === newState.error
			)
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
			isUsedRef.current.loading = true;
			return currentDataRef.current.isLoading
		},
		get error() {
			isUsedRef.current.error = true;
			return currentDataRef.current.error
		},
		get data() {
			isUsedRef.current.data = true;
			return currentDataRef.current.data
		},
		fetch: async function (...args: A) {
			if ( !isOnline ) {
				return await Promise.reject(new Error('No internet'))
			}

			if ( currentDataRef.current.error ) {
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
	};

	const deps = [isOnline, _config.enable, ...(_config.deps ?? [])];

	if ( isFetchEffect ) {
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
		}, deps)

		// This is to make sure onFocus will only trigger if the hook commands the data,
		// Otherwise it can lead to errors
		if ( isFetchEffectWithData ) {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			useOnFocusFetch(
				async () => {
					if ( currentDataRef.current.error ) {
						currentDataRef.current.error = null;
						NotificationService.notifyById(id);
					}
					await (noLoadingFetch as () => Promise<any>)();
					NotificationService.notifyAll();
				},
				_config.enable !== false ? (_config.onWindowFocus ?? true) : false
			);

			result.setFetchState = (data: Result) => {
				currentDataRef.current.data = data;

				onDataChange && onDataChange(data)

				NotificationService.notifyAll();
			};
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
	}, deps)

	return result
}
