import { useEffect, useRef } from 'react';

import { ScrollRestorationIdIsUndefined } from '../errors/ScrollRestorationIdIsUndefined';
import { IS_DEV } from '../utils/constants';

import { type VisitedUrl } from './useOnScroll/types';
import { type ElementWithScrollTo, useOnScroll } from './useOnScroll/useOnScroll';

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

export const useBaseScrollRestoration = <T extends ElementWithScrollTo | null>(
	visitedUrl: Map<string, VisitedUrl>,
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
	if ( IS_DEV ) {
		if ( !scrollRestorationId ) {
			throw new ScrollRestorationIdIsUndefined();
		}
	}

	const canRestore = useRef(false);
	const [ref, onScroll] = useOnScroll<T>((pos) => {
		const existingRecord = visitedUrl.get(scrollRestorationId);

		visitedUrl.set(
			scrollRestorationId, 
			{
				...existingRecord,
				pos
			}
		);
	});

	useEffect(() => {
		canRestore.current = action === 'pop';
	}, [action])

	useEffect(() => {
		if ( action !== 'pop' ) {
			visitedUrl.delete(scrollRestorationId);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const scrollRestore = (behavior: ScrollBehavior = 'auto') => {
		if ( canRestore.current ) {
			const existingRecord = visitedUrl.get(scrollRestorationId);

			if ( existingRecord !== undefined ) {
				globalThis.requestAnimationFrame(() => {
					if ( ref.current ) {
						ref.current.scrollTo({
							...existingRecord,
							behavior,
							animated: behavior === 'smooth'
						} as any);
					}
				});
				visitedUrl.delete(scrollRestorationId);
			}
		}
	}

	return [scrollRestore, ref, onScroll] as const;
};
