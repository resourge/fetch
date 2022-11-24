import { useEffect, useRef } from 'react';

import { ScrollRestorationIdIsUndefined } from '../errors/ScrollRestorationIdIsUndefined';

import { ElementWithScrollTo, useOnScroll } from './useOnScroll/useOnScroll';

type ScrollPos = {
	left: number
	top: number
}

const visitedUrl = new Map<string, ScrollPos>();

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
	if ( __DEV__ ) {
		if ( !scrollRestorationId ) {
			throw new ScrollRestorationIdIsUndefined();
		}
	}

	const canRestore = useRef(false);
	const [ref, onScroll] = useOnScroll<T>((pos) => {
		visitedUrl.set(
			scrollRestorationId, 
			pos
		);
	});

	useEffect(() => {
		if ( action === 'pop' ) {
			canRestore.current = true;
		}
		else {
			canRestore.current = false;
		}
	}, [action])

	useEffect(() => {
		if ( action !== 'pop' ) {
			visitedUrl.set(scrollRestorationId, {
				left: 0,
				top: 0 
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const scrollRestore = (behavior: ScrollBehavior = 'auto') => {
		if ( canRestore.current ) {
			const existingRecord = visitedUrl.get(scrollRestorationId);

			if (existingRecord !== undefined) {
				window.requestAnimationFrame(() => {
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
