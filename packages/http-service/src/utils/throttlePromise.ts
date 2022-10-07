const cache: Map<string, { timestamp: number, value?: Promise<any> }> = new Map();

/**
 * Method to throttle promises. Makes the same request, when executed multiple times, 
 * only send once and all promises wait the same result.
 */
export const throttlePromise = (
	cacheKey: string,
	cb: () => Promise<any>,
	threshold: number
) => {
	const now = Date.now();

	const cachedRecord = cache.get(cacheKey) ?? {
		timestamp: now 
	};

	if (now - cachedRecord.timestamp <= threshold) {
		const responsePromise = cachedRecord.value;
		if (responsePromise) {
			return responsePromise;
		}
	}
	
	cachedRecord.value = cb().finally(() => {
		cache.delete(cacheKey);
	});
	
	cache.set(cacheKey, cachedRecord);

	return cachedRecord.value;
}
