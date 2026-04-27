import { useBaseScrollRestoration } from '../useBaseScrollRestoration';
import { type VisitedUrl } from '../useOnScroll/types';
import { type ElementWithScrollTo } from '../useOnScroll/useOnScroll';

const visitedUrl = new Map<string, VisitedUrl>();

export interface InfiniteScrollRestoration {
	(behavior: ScrollBehavior): void
	getPage: () => VisitedUrl
	setPage: (page: number, perPage: number) => void
}

/**
 * Method to restore scroll.
 * If return `ref` is not set, it will assume window
 * @param scrollRestorationId 
 * @example
 * ```Typescript
  // useAction will probably be from a navigation/router package
  // Ex: import { useAction } from '@resourge/react-router';
  const action = useAction();
  // 'action' must be 'pop' for restoration to work;
  const [scrollRestoration, ref] = useInfiniteScrollRestoration(action);
  const {} = useInfiniteLoading(
	  async () => {
		  return HttpService.get("url")
	  }, 
	  {
		  initialState: [],
		  scrollRestoration
	  }
  );
```
 */
export const useInfiniteScrollRestoration = <T extends ElementWithScrollTo | null>(
	/**
	 * Action defines if scroll restoration can be executed.
	 * Only on 'pop' will the scroll be restored.
	 */
	action: string,
	/**
	 * Unique id categorizing current component. Must be the same between render or component changes for scroll restoration to work.
	 */
	scrollRestorationId: string = globalThis?.location?.pathname
) => {
	const [scrollRestoration, ref, onScroll] = useBaseScrollRestoration<T>(visitedUrl, action, scrollRestorationId) as [InfiniteScrollRestoration, React.RefObject<T>, (event: React.UIEvent<T, UIEvent>) => void];

	// eslint-disable-next-line react-hooks/immutability
	scrollRestoration.getPage = () => {
		return visitedUrl.get(scrollRestorationId)!;
	};

	// eslint-disable-next-line react-hooks/immutability
	scrollRestoration.setPage = (page: number, perPage: number) => {
		const existingRecord = visitedUrl.get(scrollRestorationId);

		visitedUrl.set(
			scrollRestorationId,
			{
				page,
				perPage,
				pos: existingRecord?.pos
			}
		);
	};

	return [scrollRestoration as (behavior?: ScrollBehavior) => void, ref, onScroll] as const;
};
