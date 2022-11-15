import { useEffect } from 'react';

import { useFetchContext } from '../context/FetchContext';
import NotificationService from '../services/NotificationService';
import { useId } from '../utils/useIdShim';

import { useFetchCallback, UseFetchCallbackConfig, UseFetchCallbackValue } from './useFetchCallback';
import { useOnFocusFetch } from './useOnFocusFetch';

type UseFetchValue<T = any> = Omit<UseFetchCallbackValue<undefined[], T>, 'fetch'> & {
	fetch: () => Promise<void>
};

export type UseFetchResult<T = any> = UseFetchValue<T> 
& [
	UseFetchValue<T>['data'],
	() => Promise<void>,
	UseFetchValue<T>['isLoading'],
	UseFetchValue<T>['error'],
	UseFetchValue<T>['setData']
]

export type UseFetchConfig<T = any> = Omit<UseFetchCallbackConfig<T>, 'initialState'> & {
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
	 * Fetch on window focus
	 * @default true
	 */
	onWindowFocus?: boolean

	/**
	 * Serves to restore scroll position
	 */
	scrollRestoration?: ((behavior?: ScrollBehavior) => void) | Array<(behavior?: ScrollBehavior) => void>
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
		deps = [], 
		onWindowFocus: _onWindowFocus,
		scrollRestoration,
		...fetchConfig 
	}: UseFetchConfig<T>
): UseFetchResult<T> {
	const httpContext = useFetchContext();

	const id = useId();

	const abort = fetchConfig?.abort ?? true;
	const onWindowFocus = _onWindowFocus ?? httpContext?.config?.onWindowFocus ?? true;

	const result = useFetchCallback<undefined[], T>(method, {
		...fetchConfig,
		abort 
	})

	useOnFocusFetch(
		async () => {
			await result.noLoadingFetch();
			NotificationService.notify(id);
		},
		onWindowFocus
	);

	useEffect(() => {
		result()
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

	const setData = result[4];
	const data = result[3];
	const error = result[2];
	const isLoading = result[1];
	const fetch = result[0];

	const _result: UseFetchResult<T> = result as unknown as UseFetchResult<T>;

	_result[4] = setData
	_result[3] = error
	_result[2] = isLoading
	_result[1] = fetch as () => Promise<void>
	_result[0] = data

	return _result
}
