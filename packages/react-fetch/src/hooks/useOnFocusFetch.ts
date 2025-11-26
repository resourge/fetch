import { throttleMethod } from '../utils/throttleMethod';

import { useEffectEvent } from './useEffectEvent';
import { useOnFocus } from './useOnFocus/useOnFocus';

const threshold = 10 * 60 * 1000;

/**
 * Triggers on window's focus, after blur.
 */
export const useOnFocusFetch = (
	fetch: () => Promise<void>,
	onWindowFocus?: boolean
) => {
	const _fetch = useEffectEvent(fetch);

	useOnFocus(
		() => {
			let dateNow = Date.now();
			const fetchOnWindowFocus = throttleMethod(() => {
				_fetch()
				.finally(() => {
					dateNow = Date.now()
				})
			}, 1000);
		
			return {
				focus: () => {
					const now = Date.now();

					if (now - dateNow <= threshold ) {
						return;
					}

					fetchOnWindowFocus();
				},
				blur: () => {
					dateNow = Date.now();
				},
				clear: fetchOnWindowFocus.clear
			}
		},
		onWindowFocus
	);
}
