import {
	type RefObject,
	type UIEvent,
	useEffect,
	useEffectEvent,
	useRef
} from 'react';

import { type ScrollPos } from './types';

export const getScrollPage = (): ScrollPos => {
	let docScrollTop = 0;
	let docScrollLeft = 0;
	if (document.documentElement && document.documentElement !== null) {
		docScrollTop = document.documentElement.scrollTop;
		docScrollLeft = document.documentElement.scrollLeft;
	}
	return {
		left: window.pageXOffset || docScrollLeft,
		top: window.pageYOffset || docScrollTop
	};
};

export type ElementWithScrollTo = HTMLElement;

export const useOnScroll = <T extends ElementWithScrollTo | null>(
	scrollMethod: (position: ScrollPos) => void
): [
		ref: RefObject<T>,
		onScroll: (event: UIEvent<T>) => void
] => {
	const ref = useRef<T | Window>(globalThis as unknown as Window);
	const onScrollRef = useEffectEvent<(position: ScrollPos) => void>(scrollMethod);

	const onScroll = (event: UIEvent<T>) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		onScrollRef({
			left: event.currentTarget.scrollLeft,
			top: event.currentTarget.scrollTop
		});
	};

	useEffect(() => {
		const element = ref.current;
		if (element) {
			const onScroll = () => {
				onScrollRef(
					element instanceof Window
						? getScrollPage()
						: {
							left: element.scrollLeft,
							top: element.scrollTop
						}
				);
			};

			element.addEventListener('scroll', onScroll, true);

			return () => {
				element.removeEventListener('scroll', onScroll, true);
			};
		}
	}, [ref.current]);

	return [ref as RefObject<T>, onScroll];
};
