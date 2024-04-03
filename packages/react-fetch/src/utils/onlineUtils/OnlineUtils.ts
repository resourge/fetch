export function OnlineGetSnapshot() {
	return typeof globalThis.navigator !== 'undefined' ? globalThis.navigator.onLine : true;
}

export const OnlineSubscribe = typeof globalThis.window !== 'undefined' && typeof globalThis.window.addEventListener !== 'undefined'
	? (callback: () => void) => {
		window.addEventListener('online', callback);
		window.addEventListener('offline', callback);
		return () => {
			window.removeEventListener('online', callback);
			window.removeEventListener('offline', callback);
		};
	} : () => {
		return () => {

		}
	}
