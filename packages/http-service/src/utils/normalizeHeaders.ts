import { FetchError } from '../errors/FetchError';
import { type RequestConfig } from '../types/RequestConfig';

import { type HttpResponseConfig } from './HttpResponse';
import { type Interceptor, type InterceptorOnRequest } from './Interceptors';
import {
	createUrl,
	isBrowser,
	isURLSameOrigin,
	readCookie
} from './utils';

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
			config.headers![xsrfHeaderName] = xsrfValue;
		}
	}
};

export const normalizeHeaders = (
	config: HttpResponseConfig,
	defaultHeaders: Record<string, string>
) => {
	config.headers = {
		...defaultHeaders,
		...config.headers
	};

	if (!config.headers.accept) {
		config.headers.accept = 'application/json, text/plain, */*';
	}

	config.cache = config.cache ?? 'default';

	normalizeCookies(config);
};

export const normalizeBody = (
	config: HttpResponseConfig
) => {
	const key = Object.keys(config.headers).find((key) => key.toLowerCase() === 'content-type');
	if (key) {
		config.headers['Content-Type'] = config.headers[key];
	}

	if (config.data) {
		if (
			config.data instanceof FormData
			|| config.data instanceof Blob
			|| config.data instanceof URLSearchParams
			|| config.data instanceof ArrayBuffer || (
				globalThis.ReadableStream !== undefined && config.data instanceof ReadableStream
			) || (
				typeof config.data === 'object'
				&& (
					Object.keys(config.data).length > 0
					&& config.data.buffer != null
					&& config.data.byteLength != null
					&& config.data.byteOffset != null
				)
			)
		) {
			return config.data;
		}
		else if (typeof config.data === 'object') {
			config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';

			return JSON.stringify(config.data);
		}
	}

	return config.data;
};

export type NormalizeRequestConfig = Omit<RequestConfig, 'url'> & { url: URL };

const permittedProtocols = new Set(['file:', 'http:', 'https:']);

type NormalizeRequestConfigType = {
	baseUrl: string
	config: NormalizeRequestConfig
	defaultHeaders: Record<string, string>
	interceptors: Interceptor
	setToken: InterceptorOnRequest
};

/**
 * Normalize request, by injecting headers, and transform data into body.
 * @param config 
 * @param interceptors 
 */
export const normalizeRequest = async ({
	baseUrl,
	config,
	defaultHeaders,
	interceptors,
	setToken
}: NormalizeRequestConfigType): Promise<HttpResponseConfig> => {
	try {
		let _config: HttpResponseConfig = {
			...config,
			method: config.method.toUpperCase(),
			url: createUrl(config.url, baseUrl)
		} as HttpResponseConfig;

		_config.url.searchParams.sort();

		_config.signal = config.controller?.signal;

		normalizeHeaders(_config, defaultHeaders);

		if (
			config.url.protocol && !permittedProtocols.has(config.url.protocol)
		) {
			throw new FetchError('Unsupported protocol ' + config.url.protocol);
		}

		_config = await Promise.resolve(setToken(_config));

		await Promise.all(
			interceptors.request.values.map(async ({ onRequest }) => {
				_config = await Promise.resolve(onRequest(_config));
			})
		);

		(_config as RequestConfig & { body: RequestInit['body'] }).body = normalizeBody(_config);

		return _config;
	}
	catch (error) {
		if (error instanceof Error) {
			await Promise.all(
				interceptors.request.values.map(async ({ onRequestError }) => {
					if (onRequestError) {
						await Promise.resolve(onRequestError(FetchError.setFromError(error)));
					}
				})
			);
		}

		throw error;
	}
};
