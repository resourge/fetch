import { useFetchContext } from '../context/FetchContext';

/**
 * Hook that returns a method to trigger other useFetch's.
 * @param fetchId - useFetch id
 */
export function useTriggerFetch<Result = any, T extends any[] = any[]>(fetchId: string) {
	const httpContext = useFetchContext();

	const request = (...args: T): Promise<Result> => {
		const triggerRequest = httpContext?.request.get(fetchId);

		if ( !triggerRequest ) {
			const error = new Error(`No '${fetchId}' request was found.`);
			error.name = 'TriggerFetchNotFound'
			throw error
		}

		return triggerRequest(...args);
	}

	return request;
}
