import {
	type MutableRefObject,
	type UIEvent,
	useEffect,
	useRef
} from 'react'

import { type ScrollPos } from './types';

export const getScrollPage = (): ScrollPos => {
	let docScrollTop = 0;
	let docScrollLeft = 0;
	if (document.documentElement && document.documentElement !== null) {
		docScrollTop = document.documentElement.scrollTop;
		docScrollLeft = document.documentElement.scrollLeft;
	}
	return {
		top: window.pageYOffset || docScrollTop,
		left: window.pageXOffset || docScrollLeft
	};
};

export type ElementWithScrollTo = HTMLElement

export const useOnScroll = <T extends ElementWithScrollTo | null>(
	scrollMethod: (position: ScrollPos) => void
): [
	ref: MutableRefObject<T>, 
	onScroll: (event: UIEvent<T>) => void
] => {
	const ref = useRef<T | Window>(window);
	const onScrollRef = useRef<(position: ScrollPos) => void>(scrollMethod);

	onScrollRef.current = scrollMethod;

	const onScroll = (event: UIEvent<T>) => {
		onScrollRef.current({
			left: event.currentTarget.scrollLeft,
			top: event.currentTarget.scrollTop
		});
	}

	useEffect(() => {
		const element = ref.current;
		if ( element ) {
			const onScroll = () => {
				onScrollRef.current(
					element instanceof Window 
						? getScrollPage()
						: {
							top: element.scrollTop,
							left: element.scrollLeft
						}
				);
			}
			
			element.addEventListener('scroll', onScroll, true)
		
			return () => {
				element.removeEventListener('scroll', onScroll, true)
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref.current])

	return [ref as MutableRefObject<T>, onScroll];
}
