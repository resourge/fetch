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
	 * By default is null
	 */
	root?: IntersectionObserverInit['root']
	| MutableRefObject<IntersectionObserverInit['root']>
};

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
			const _root = root &&
				(root as MutableRefObject<IntersectionObserverInit['root']>).current
				? (root as MutableRefObject<IntersectionObserverInit['root']>).current
				: (root as IntersectionObserverInit['root']);

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
