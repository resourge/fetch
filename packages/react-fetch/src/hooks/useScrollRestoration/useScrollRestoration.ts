import { useBaseScrollRestoration } from '../useBaseScrollRestoration/useBaseScrollRestoration';
import { type VisitedUrl } from '../useOnScroll/types';
import { type ElementWithScrollTo } from '../useOnScroll/useOnScroll';

const visitedUrl = new Map<string, VisitedUrl>();

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
  const [scrollRestoration, ref] = useScrollRestoration(action);
  const [data, fetch, error] = useFetch(
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

export const useScrollRestoration = <T extends ElementWithScrollTo | null>(
	/**
	 * Action defines if scroll restoration can be executed.
	 * Only on 'pop' will the scroll be restored.
	 */
	action: 'pop' | string,
	/**
	 * Unique id categorizing current component. Must be the same between render or component changes for scroll restoration to work.
	 */
	scrollRestorationId: string = window?.location?.pathname
) => {
	return useBaseScrollRestoration<T>(visitedUrl, action, scrollRestorationId)
};
