import { FetchContextType, FetchTriggerValues } from '../context';

/**
 * Triggers after or before fetch's
 */
export const triggerFetch = async (context?: FetchContextType, triggers?: FetchTriggerValues) => {
	if ( triggers && context ) {
		const requestPromise: Array<Promise<void>> = [];
		for (const [key, value] of context.request.entries()) {
			const after = triggers.find((val) => (
				(typeof val === 'string' && val === key) ||
				(typeof val === 'object' && val.loaderId === key)
			));
			if ( after) {
				requestPromise.push(
					typeof after === 'object' ? value.request(...after.params) : value.request() 
				)
			}
		}

		if ( requestPromise.length ) {
			await Promise.all(requestPromise)
		}
	}
}
