import { useEffect, useRef } from 'react';

import NotificationService from '../services/NotificationService';

/**
 * When deps change all useFetch's (in mounted components and with deps) will trigger.
 * Serves to remove the need to put the same dependency on all useFetch's
 * @param deps - Dependencies that will trigger requests on useFetch's in components mounted
 * @param filterRequest - To filter all request not need by this "deps". `id` is equal to useFetch config id.
 */

export const useFetchOnDependencyUpdate = <T = any[]>(deps: T, filterRequest?: (id: string) => boolean) => {
	const firstRef = useRef(true);
	
	useEffect(() => {
		if ( !firstRef.current ) {
			NotificationService.requestAllAgain(filterRequest);
		}
		firstRef.current = false;
	// @ts-expect-error Deeps need to be defined by the user
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)
}
