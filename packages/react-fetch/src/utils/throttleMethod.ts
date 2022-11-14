const cacheMethod: Map<string, number> = new Map();

export const throttleMethod = <T extends any[]>(
	method: (...args: T) => any,
	threshold: number = 1000
) => {
	const cacheKey = String(Date.now());
	cacheMethod.set(cacheKey, Date.now());

	const _throttleMethod = (...args: T) => {
		const now = Date.now();

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const cachedRecord = cacheMethod.get(cacheKey)!;

		if (now - cachedRecord <= threshold) {
			return;
		}

		method(...args);
		cacheMethod.set(cacheKey, now);
	};

	/**
	 * Clear's throttleMethod
	 */
	_throttleMethod.clear = () => {
		cacheMethod.delete(cacheKey);
	}

	return _throttleMethod;
}
