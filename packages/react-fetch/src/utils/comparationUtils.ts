import { type FilterKeysState } from './createProxy';

export function deepCompare(
	obj1?: any,
	obj2?: any,
	keysToCheck: FilterKeysState = {
		keys: new Set() 
	}
): boolean {
	if (obj1 === obj2) {
		return true;
	}

	if ( obj1 instanceof Date && obj2 instanceof Date ) {
		return obj1.getTime() === obj2.getTime()
	}

	if ( !obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object' ) {
		// Handles cases where one is an object and the other is not, or one of them is null
		return false;
	}

	// Handle arrays comparison
	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if ( obj1.length !== obj2.length ) {
			return false
		}
		const filteredObj1 = keysToCheck.keys.size
			? obj1.filter((_, i) => keysToCheck.keys.has(String(i)))
			: obj1;
		const filteredObj2 = keysToCheck.keys.size
			? obj2.filter((_, i) => keysToCheck.keys.has(String(i)))
			: obj2;

		return filteredObj1.length === filteredObj2.length && 
			filteredObj1.every((item, i) => deepCompare(item, filteredObj2[i], keysToCheck.state));
	}

	// Get the keys of each object
	const keys1 = keysToCheck.keys.size 
		? Object.keys(obj1).filter((key) => keysToCheck.keys.has(key))
		: Object.keys(obj1);
	const keys2 = keysToCheck.keys.size 
		? Object.keys(obj2).filter((key) => keysToCheck.keys.has(key))
		: Object.keys(obj2);

	// Check if both objects have the same number of keys
	if (keys1.length !== keys2.length) return false;

	return keys1.every((key) => keys2.includes(key) && deepCompare(obj1[key], obj2[key], keysToCheck.state))
}
