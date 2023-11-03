import { FetchError } from '../errors/FetchError';
import { type RequestConfig } from '../types/RequestConfig';

import { type InterceptorOnRequest, type Interceptor, type InterceptorRequestConfig } from './Interceptors';
import {
	createUrl,
	isBrowser,
	isURLSameOrigin,
	readCookie
} from './utils'

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

export const normalizeHeaders = (config: InterceptorRequestConfig) => {
	config.headers = config.headers ?? {}

	if ( !config.headers.accept ) {
		config.headers.accept = 'application/json, text/plain, */*'
	}
	
	config.cache = config.cache ?? 'default';

	normalizeCookies(config);
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
export const normalizeRequest = async (
	config: NormalizeRequestConfig,
	setToken: InterceptorOnRequest,
	interceptors: Interceptor,
	baseUrl: string
) => {
	try {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		let _config: InterceptorRequestConfig = {
			...config
		} as InterceptorRequestConfig;

		_config.method = config.method.toUpperCase();

		_config.url = createUrl(config.url, baseUrl)

		_config.url.searchParams.sort();
		
		normalizeHeaders(_config);

		if (
			config.url.protocol && !permittedProtocols.includes(config.url.protocol)
		) {
			throw new FetchError('Unsupported protocol ' + config.url.protocol);
		}

		_config = await Promise.resolve(setToken(_config));

		await Promise.all(
			interceptors.request.values.map(async ({ onRequest }) => {
				_config = await Promise.resolve(onRequest(_config));
			})
		);
		
		(_config as RequestConfig & { body: RequestInit['body'] }).body = normalizeBody(_config)

		return _config;
	}
	catch (e) {
		if ( e instanceof Error ) {
			await Promise.all([
				interceptors.request.values.map(async ({ onRequestError }) => {
					if ( onRequestError ) {
						await Promise.resolve(onRequestError(FetchError.setFromError(e as any)));
					}
				})
			]);
		}
		throw e;
	}
}
