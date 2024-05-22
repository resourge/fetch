import { type ReactNode, useEffect, useRef } from 'react';

import { type InfiniteLoadingReturn } from '../../hooks';

type Props<
	Data extends any[],
	Filter extends Record<string, any> = Record<string, any>,
> = {
	context: InfiniteLoadingReturn<Data, Filter>
	renderComponent: (props: { isLastIncomplete: boolean, onClick: () => void }) => ReactNode
	/**
	 * By default is 100%
	 */
	detectionMargin?: string
}

/**
 * Component to help useInfiniteScroll control the scroll
 */
function RefreshControl<
	Data extends any[],
	Filter extends Record<string, any> = Record<string, any>,
>({
	context, detectionMargin = '100%', renderComponent 
}: Props<Data, Filter>) {
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if ( ref.current ) {
			const observer = new IntersectionObserver(
				(entries) => {
					if ( entries[0].isIntersecting ) {
						context.preload();
					}
				}, 
				{
					root: document,
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
	}, [detectionMargin]); 

	return (
		<div ref={ref}>
			{
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
