import { FetchError } from '../errors/FetchError';
import { RequestConfig } from '../types/RequestConfig';

import { Interceptor } from './Interceptors';
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

export const normalizeHeaders = (config: RequestConfig) => {
	const _config: RequestConfig = {
		...config
	};

	if (!_config.headers ) {
		_config.headers = {};
	}

	if ( !_config.headers || !_config.headers.Accept ) {
		_config.headers.Accept = 'application/json, text/plain, */*'
	}
	if ( !_config.headers || !_config.headers['Content-Type'] ) {
		_config.headers['Content-Type'] = 'application/json'
	}

	_config.cache = _config.cache ?? 'default';

	normalizeCookies(_config);

	return _config;
}

export const normalizeBody = (
	config: RequestConfig
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
		}
	}

	return config.data ? JSON.stringify(config.data) : null
}

export type NormalizeRequestConfig = Omit<RequestConfig, 'url'> & { url: URL }

/**
 * Normalize request, by injecting headers, and transform data into body.
 * @param config 
 * @param interceptors 
 */
export const normalizeRequest = (
	config: NormalizeRequestConfig,
	interceptors: Interceptor
) => {
	try {
		let _config: RequestConfig = normalizeHeaders(config)

		_config.method = _config.method.toUpperCase();

		if (
			config.url.protocol && !['http:', 'https:', 'file:'].includes(config.url.protocol)
		) {
			throw new FetchError('Unsupported protocol ' + config.url.protocol);
		}

		for (const { onRequest } of interceptors.request.values) {
			_config = onRequest(_config);
		}
		
		if ( _config.data ) {
			if ( 
				_config.data instanceof FormData ||
				_config.data instanceof Blob ||
				_config.data instanceof URLSearchParams ||
				_config.data instanceof ArrayBuffer ||
				_config.data instanceof ReadableStream
			) {
				(_config as RequestConfig & { body: RequestInit['body'] }).body = _config.data as any
			}
			else if ( typeof _config.data === 'object' ) {
				if ( 
					Object.keys(_config.data).length &&
					_config.data.buffer != null &&
					_config.data.byteLength != null &&
					_config.data.byteOffset != null
				) {
					(_config as RequestConfig & { body: RequestInit['body'] }).body = _config.data 
				}
				else {
					(_config as RequestConfig & { body: RequestInit['body'] }).body = JSON.stringify(_config.data)
				}
			}
			else {
				(_config as RequestConfig & { body: RequestInit['body'] }).body = JSON.stringify(_config.data)
			}
		}

		return _config;
	}
	catch (e) {
		if ( e instanceof Error ) {
			for (const { onRequestError } of interceptors.request.values) {
				onRequestError(FetchError.setFromError(e));
			}
		}
		throw e;
	}
}
