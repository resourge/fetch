/* eslint-disable no-useless-escape */
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

/**
 * Checks if URL has the same origin as requestUrl
 */
export const isURLSameOrigin = ((): (url: string | URL) => boolean => {
	if ( isBrowser() ) {
		const originURL = new URL(window.location.href)

		return (url: string | URL) => {
			const parsedUrl = new URL(url as string);
			return (
				parsedUrl.protocol === originURL.protocol &&
				parsedUrl.host === originURL.host
			)
		}
	}

	return () => true
})()

const URL_PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
/**
 * Return an url. In case it doesn't have origin/domain/host it will use baseUrl.
 */
export function createUrl(url: URL | string, baseUrl: string): URL {
	if ( typeof url === 'string' ) {
		if ( URL_PATTERN.test(url) ) {
			return new URL(url);
		}

		const includeSlash = !baseUrl.endsWith('/') && !url.startsWith('/')

		return new URL(`${baseUrl}${includeSlash ? '/' : ''}${url}`);
	}
	return url;
}

/**
 * Check if error is an AbortError
 */
export function isAbortedError(e: any): boolean {
	return (
		e &&
		typeof e === 'object' &&
		(
			(
				(e as { data: { name: string } }).data &&
				typeof (e as { data: { name: string } }).data === 'object' &&
				(e as { data: { name: string } }).data.name === 'AbortError'
			) || (
				(e as { name: string }).name === 'AbortError'
			)
		)
	)
}
