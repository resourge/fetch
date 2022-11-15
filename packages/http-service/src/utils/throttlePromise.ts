const cache: Map<string, { timestamp: number, value?: Promise<any> }> = new Map();
const maxCacheItems = 10;

const add = (key: string, value: { timestamp: number, value?: Promise<any> }) => {
	if ( cache.size > maxCacheItems ) {
		const [firstKey] = cache.keys();

		cache.delete(firstKey);
	}
	cache.set(key, value);
}

const get = (key: string, defaultValue: { timestamp: number, value?: Promise<any> }) => {
	return cache.get(key) ?? defaultValue
}

/**
 * Method to throttle promises. Makes the same request, when executed multiple times, 
 * only send once and all promises wait the same result.
 */
export const throttlePromise = (
	cacheKey: string,
	cb: () => Promise<any>,
	threshold: number
) => {
	if ( threshold === 0 ) {
		return cb();
	}
	const now = Date.now();

	const cachedRecord = get(cacheKey, {
		timestamp: now 
	});

	if (now - cachedRecord.timestamp <= threshold) {
		const responsePromise = cachedRecord.value;
		if (responsePromise) {
			return responsePromise;
		}
	}
	
	cachedRecord.value = cb();
	cachedRecord.timestamp = now;
	
	add(cacheKey, cachedRecord);

	return cachedRecord.value;
}
