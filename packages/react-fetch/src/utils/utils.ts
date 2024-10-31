export const calculateTotalPages = (perPage: number, totalItems: number = 0) => Math.ceil(totalItems / perPage) || 1;

export function isBuiltinWithMutableMethods(value: any) {
	return value instanceof Date ||
		value instanceof Set ||
		value instanceof Map ||
		value instanceof WeakSet ||
		value instanceof WeakMap ||
		ArrayBuffer.isView(value);
}
