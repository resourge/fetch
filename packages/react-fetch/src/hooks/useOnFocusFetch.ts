import { MutableRefObject, useRef } from 'react';

import { throttleMethod } from '../utils/throttleMethod';

import { FetchCallbackResult } from './useFetchCallback';
import { useOnFocus } from './useOnFocus/useOnFocus';

/**
 * Triggers on window's focus, after blur.
 */
export const useOnFocusFetch = <T extends any[]>(
	fetch: () => Promise<void>,
	isFetching: FetchCallbackResult<T>['isFetching'],
	shouldLoadingRef: MutableRefObject<boolean>,
	onWindowFocus?: boolean
) => {
	const fetchRef = useRef<{
		fetch: () => Promise<void>
		isFetching: FetchCallbackResult<T>['isFetching']
	}>({
				fetch,
				isFetching
			});

	fetchRef.current = {
		fetch,
		isFetching
	};

	useOnFocus(
		() => {
			let dateNow = Date.now();
			const fetchOnWindowFocus = throttleMethod(() => {
				shouldLoadingRef.current = false;
				fetchRef.current.fetch()
				.finally(() => {
					shouldLoadingRef.current = true;
				});
			}, 1000);

			const focus = () => {
				const now = Date.now();

				if ( fetchRef.current.isFetching() ) {
					dateNow = Date.now();
				}

				if (now - dateNow <= 10000 ) {
					return;
				}

				fetchOnWindowFocus();
			}
			const blur = () => {
				dateNow = Date.now();
			}

			return {
				focus,
				blur
			}
		},
		onWindowFocus
	);
}
