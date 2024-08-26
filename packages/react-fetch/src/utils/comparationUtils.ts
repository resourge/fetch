export function booleanCompare(a: boolean = false, b: boolean = false) {
	return Boolean(Number(a) - Number(b));
}

export function deepCompare(
	obj1?: any,
	obj2?: any
): boolean {
	// Check if both arguments are strictly equal
	if (obj1 === obj2) return true;

	if (typeof obj1 !== 'object' || typeof obj2 !== 'object' ) {
		// Handles cases where one is an object and the other is not, or one of them is null
		return false;
	}

	// If both are arrays
	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if (obj1.length !== obj2.length) {
			return false;
		}

		// Compare elements of both arrays
		for (let i = 0; i < obj1.length; i++) {
			if (!deepCompare(obj1[i], obj2[i])) {
				return false;
			}
		}
		return true;
	}

	// If one is an array and the other is not, return false
	if (Array.isArray(obj1) !== Array.isArray(obj2)) {
		return false;
	}

	// Get the keys of each object
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	// Check if both objects have the same number of keys
	if (keys1.length !== keys2.length) return false;

	return !keys1.some((key) => !keys2.includes(key) || !deepCompare(obj1[key], obj2[key]))
}
