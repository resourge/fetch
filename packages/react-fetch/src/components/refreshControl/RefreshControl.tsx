import {
	type MutableRefObject,
	type ReactNode,
	useEffect,
	useRef
} from 'react'

import { type InfiniteLoadingReturn } from '../../hooks';

type RefreshControlProps<
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = {
	context: InfiniteLoadingReturn<Data, FilterSearchParams>
	detectionMargin?: string
	/**
	 * By default is false
	 */
	preload?: boolean
	renderComponent?: (props: {
		isLastIncomplete: boolean
		onClick: () => void
	}) => ReactNode
	/**
	 * Determines the nearest scrolling parent (overflow container) by default.
	 * If no `root` is provided, it searches for the closest overflow parent, otherwise, it defaults to the `window`.
	 */
	root?: IntersectionObserverInit['root']
	| MutableRefObject<IntersectionObserverInit['root']>
};

function getOverflowParent(element: HTMLElement | null) {
	while (element && element !== document.body) {
		const overflowY = window.getComputedStyle(element).overflowY;
		const overflowX = window.getComputedStyle(element).overflowX;

		if (
			(
				(overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') && 
				element.scrollHeight > element.clientHeight
			) || (
				(overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') && 
				element.scrollWidth > element.clientWidth
			)
		) {
			return element;
		}

		element = element.parentElement;
	}

	return null; // No overflow parent found
}

/**
 * Component to help useInfiniteScroll control the scroll
 */
function RefreshControl<
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>({
	context,
	root = null,
	detectionMargin,
	renderComponent,
	preload
}: RefreshControlProps<Data, FilterSearchParams>) {
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (ref.current) {
			const _root = (
				root &&
				(root as MutableRefObject<IntersectionObserverInit['root']>).current
					? (root as MutableRefObject<IntersectionObserverInit['root']>).current
					: (root as IntersectionObserverInit['root'])
			) ?? getOverflowParent(ref.current);

			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						if (preload) {
							context.preload();
						}
						else {
							context.loadMore();
						}
					}
				},
				{
					root: _root,
					rootMargin: detectionMargin,
					threshold: 1.0
				}
			);

			observer.observe(ref.current);

			return () => {
				observer.disconnect();
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [detectionMargin, context.data.length]);

	return (
		<div ref={ref}>
			{
				renderComponent &&
				renderComponent({
					isLastIncomplete: context.isLastIncomplete,
					onClick: () => {
						context.loadMore();
					}
				})
			}
		</div>
	);
}

export default RefreshControl;
