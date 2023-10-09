import { FetchError } from '../errors/FetchError';
import { type RequestConfig } from '../types/RequestConfig';

import { type InterceptorOnRequest, type Interceptor, type InterceptorRequestConfig } from './Interceptors';
import { isBrowser, isURLSameOrigin, readCookie } from './utils';

const xsrfCookieName = 'XSRF-TOKEN';
const xsrfHeaderName = 'X-XSRF-TOKEN';

export const normalizeCookies = (config: RequestConfig) => {
	// This is only done if running in a standard browser.
	if (isBrowser()) {
		// Add xsrf header
		const xsrfValue = isURLSameOrigin(config.url)
			? readCookie(xsrfCookieName)
			: undefined;

		if (xsrfValue) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			config.headers![xsrfHeaderName] = xsrfValue;
		}
	}
}

export const normalizeHeaders = (config: RequestConfig): InterceptorRequestConfig => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const _config: InterceptorRequestConfig = {
		...config
	} as InterceptorRequestConfig;

	_config.headers = _config.headers ?? {}

	if ( !_config.headers.accept ) {
		_config.headers.accept = 'application/json, text/plain, */*'
	}
	
	_config.cache = _config.cache ?? 'default';

	normalizeCookies(_config);

	return _config;
}

export const normalizeBody = (
	config: InterceptorRequestConfig
) => {
	if ( config.data ) {
		if ( 
			config.data instanceof FormData ||
			config.data instanceof Blob ||
			config.data instanceof URLSearchParams ||
			config.data instanceof ArrayBuffer ||
			config.data instanceof ReadableStream
		) {
			return config.data
		}
		else if ( typeof config.data === 'object' ) {
			if ( 
				Object.keys(config.data).length &&
				config.data.buffer != null &&
				config.data.byteLength != null &&
				config.data.byteOffset != null
			) {
				return config.data
			}

			const key = Object.keys(config.headers).find((key) => key.toLowerCase() === 'content-type');
			if ( key ) {
				config.headers['Content-Type'] = config.headers[key];
			}
			
			if ( !config.headers['Content-Type'] ) {
				config.headers['Content-Type'] = 'application/json'
			}

			return JSON.stringify(config.data);
		}
	}

	return config.data
}

export type NormalizeRequestConfig = Omit<RequestConfig, 'url'> & { url: URL }

const permittedProtocols = ['http:', 'https:', 'file:'];

/**
 * Normalize request, by injecting headers, and transform data into body.
 * @param config 
 * @param interceptors 
 */
export const normalizeRequest = (
	config: NormalizeRequestConfig,
	setToken: InterceptorOnRequest,
	interceptors: Interceptor
) => {
	try {
		let _config = normalizeHeaders(config)

		if (
			config.url.protocol && !permittedProtocols.includes(config.url.protocol)
		) {
			throw new FetchError('Unsupported protocol ' + config.url.protocol);
		}

		_config = setToken(_config);

		interceptors.request.values.forEach(({ onRequest }) => {
			_config = onRequest(_config);
		});
		
		(_config as RequestConfig & { body: RequestInit['body'] }).body = normalizeBody(_config)

		return _config;
	}
	catch (e) {
		if ( e instanceof Error ) {
			interceptors.request.values.forEach(({ onRequestError }) => {
				if ( onRequestError ) {
					onRequestError(FetchError.setFromError(e as any));
				}
			});
		}
		throw e;
	}
}
