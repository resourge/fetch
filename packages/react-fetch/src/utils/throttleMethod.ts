export const throttleMethod = <T extends any[]>(
	method: (...args: T) => any,
	threshold: number = 1000
) => {
	let lastCall = Date.now();

	const _throttleMethod = (...args: T) => {
		const now = Date.now();
		if (now - lastCall > threshold) {
			method(...args);
			lastCall = now;
		}
	};

	_throttleMethod.clear = () => {
		lastCall = 0;
	};

	return _throttleMethod;
}
