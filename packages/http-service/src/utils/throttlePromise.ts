type CacheType = { timestamp: number, value?: Promise<any> };
const cache = new Map<string, CacheType>();
const maxCacheItems = 10;

const add = (key: string, value: CacheType) => {
	if ( cache.size > maxCacheItems ) {
		const [firstKey] = cache.keys();

		cache.delete(firstKey);
	}
	cache.set(key, value);
}

const get = (key: string, defaultValue: CacheType): CacheType => {
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
): Promise<any> => {
	if ( threshold === 0 ) {
		if ( process.env.NODE_ENV === 'test' ) {
			return cb();
		}
		return throttlePromise(cacheKey, cb, 500);
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
