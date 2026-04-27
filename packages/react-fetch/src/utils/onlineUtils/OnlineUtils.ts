export function OnlineGetSnapshot() {
	return globalThis.navigator === undefined
		? true
		: globalThis.navigator.onLine;
}
/**
 * Subscribes to network connectivity changes.
 * @param {Function} callback - Function to call when network status changes.
 * @returns {Function} A function to unsubscribe from the network status updates.
 */
export const OnlineSubscribe = globalThis.window !== undefined && globalThis.window.addEventListener !== undefined
	? (callback: () => void) => {
		globalThis.addEventListener('online', callback);
		globalThis.addEventListener('offline', callback);
		return () => {
			globalThis.removeEventListener('online', callback);
			globalThis.removeEventListener('offline', callback);
		};
	}
	: () => {
		return () => {

		};
	};
