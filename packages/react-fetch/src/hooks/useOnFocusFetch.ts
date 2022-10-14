import { useRef } from 'react';

import { throttleMethod } from '../utils/throttleMethod';

import { useOnFocus } from './useOnFocus/useOnFocus';

const threshold = 10 * 60 * 1000;

/**
 * Triggers on window's focus, after blur.
 */
export const useOnFocusFetch = (
	fetch: () => Promise<void>,
	onWindowFocus?: boolean
) => {
	const fetchRef = useRef<() => Promise<void>>(fetch);

	fetchRef.current = fetch;

	useOnFocus(
		() => {
			let dateNow = Date.now();
			const fetchOnWindowFocus = throttleMethod(() => {
				fetchRef.current()
				.finally(() => {
					dateNow = Date.now()
				})
			}, 1000);

			const focus = () => {
				const now = Date.now();

				if (now - dateNow <= threshold ) {
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
