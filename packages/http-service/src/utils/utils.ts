/**
 * Check if it's a standard browser
 */
export const isBrowser = () => {
	if (
		typeof navigator !== 'undefined' && (
			navigator.product === 'ReactNative' ||
			navigator.product === 'NativeScript' ||
			navigator.product === 'NS'
		)
	) {
		return false;
	}

	return (
		typeof window !== 'undefined' && typeof document !== 'undefined'
	);
}

/**
 * Get's cookie part regarding name
 */
export function readCookie(name: string) {
	const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	return (match ? decodeURIComponent(match[3]) : null);
}

const originURL = new URL(window.location.href)

/**
 * Checks if URL has the same origin as requestUrl
 */
export function isURLSameOrigin(url: string | URL) {
	const parsedUrl = new URL(url as string);
	return (
		parsedUrl.protocol === originURL.protocol &&
		parsedUrl.host === originURL.host
	);
}
