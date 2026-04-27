import { TimeoutError } from '../errors/TimeoutError';
import { type RequestConfig } from '../types/RequestConfig';
import { formatToFormData } from '../utils/formatToFormData';
import { getCacheKey } from '../utils/getCacheKey';
import { HttpResponse, type HttpResponseConfig, HttpResponseError } from '../utils/HttpResponse';
import { Interceptor, type InterceptorOnRequest } from '../utils/Interceptors';
import { normalizeRequest, type NormalizeRequestConfig } from '../utils/normalizeHeaders';
import { throttlePromise } from '../utils/throttlePromise';
import { convertParamsToQueryString } from '../utils/transformURLSearchParams';
import { createUrl, isAbortedError } from '../utils/utils';

import QueueKingSystem from './QueueKingSystem';

export type GetMethodConfig = Omit<RequestConfig, 'method' | 'url'> & Partial<HttpServiceDefaultConfig> & {
	method?: string
	/**
	 * Throttle key
	 */
	throttleKey?: string
};

export type HttpServiceConfig = {
	baseUrl?: string
	headers?: Record<string, string>
	/**
	 * Aborts the request when time out expires
	 * @default 0
	 */
	timeout?: number
};

export type HttpServiceDefaultConfig = {
	/**
	 * If threshold is enabled
	 */
	isThresholdEnabled: boolean
	/**
	 * Default threshold for get request @default 2750 milliseconds
	 */
	threshold: number
};

export type MethodConfig = Omit<RequestConfig, 'method' | 'url'> & {
	method?: string
};

/**
 * Main service to make the requests to the server
 * It's a simple wrapper on Fetch api, adding throttle to get's
 * and the upload method.
 */
export class BaseHttpService {
	public baseUrl: string;
	/**
	 * Default config of HttpService
	 */
	public defaultConfig: Omit<HttpServiceDefaultConfig, 'signal'> = {
		isThresholdEnabled: false,
		threshold: 2750
	};

	public defaultHeaders: Record<string, string>;

	public interceptors = new Interceptor();

	public timeout: number;

	constructor({
		baseUrl = globalThis.window !== undefined && globalThis.window.location
			? globalThis.location.origin
			: '/',
		headers = {},
		timeout = 0
	}: HttpServiceConfig = {}) {
		this.baseUrl = baseUrl;
		this.defaultHeaders = headers;
		this.timeout = timeout;
	}

	public delete<T = any, R = HttpResponse<T>, D = any>(
		url: string,
		data?: D,
		config?: MethodConfig
	): Promise<R>;
	public delete<T = any, R = HttpResponse<T>, D = any>(
		url: string,
		data?: D,
		config: MethodConfig = {}
	): Promise<R> {
		return this.request<T, R>({
			...config,
			data,
			method: config.method ?? 'delete',
			url
		});
	}

	public get<T = any, R = HttpResponse<T>>(url: string): Promise<R>;
	public get<T = any, R = HttpResponse<T>>(url: string, params: undefined, config: GetMethodConfig): Promise<R>;
	public get<T = any, R = HttpResponse<T>>(url: string, params: undefined, config?: GetMethodConfig): Promise<R>;
	public get<T = any, R = HttpResponse<T>, P extends any[] | object = any>(url: string, params: P): Promise<R>;
	public get<T = any, R = HttpResponse<T>, P extends any[] | object = any>(url: string, params: P, config: GetMethodConfig): Promise<R>;
	public get<T = any, R = HttpResponse<T>, P extends any[] | object = any>(url: string, params: P, config?: GetMethodConfig): Promise<R>;
	public get<T = any, R = HttpResponse<T>, P extends any[] | object = any>(url: string, params?: P, config: GetMethodConfig = {}): Promise<R> {
		const _url = createUrl(url, this.baseUrl);

		if (params) {
			const urlSearchParams = convertParamsToQueryString(params);

			urlSearchParams.sort();

			_url.search = urlSearchParams.toString();
		}

		if (!config.controller) {
			config.controller = new AbortController();

			QueueKingSystem.send(config.controller);
		}

		const threshold = (config.isThresholdEnabled ?? QueueKingSystem.isThresholdEnabled ?? this.defaultConfig.isThresholdEnabled)
			? (config.threshold ?? this.defaultConfig.threshold)
			: 0;

		const _config: NormalizeRequestConfig = {
			...config,
			method: config.method ?? 'get',
			url: _url
		};

		// Get throttle cache key
		const cacheKey = config.throttleKey ?? getCacheKey(_config);

		return this.throttleRequest(
			cacheKey,
			threshold,
			() => this.request(_config)
		);
	}

	public patch<T = any, R = HttpResponse<T>, D = any>(
		url: string,
		data?: D,
		config?: MethodConfig
	): Promise<R>;
	public patch<T = any, R = HttpResponse<T>, D = any>(
		url: string,
		data?: D,
		config: MethodConfig = {}
	): Promise<R> {
		return this.request<T, R>({
			...config,
			data,
			method: config.method ?? 'patch',
			url
		});
	}

	public post<T = any, R = HttpResponse<T>, D = any>(
		url: string,
		data?: D,
		config?: MethodConfig
	): Promise<R>;
	public post<T = any, R = HttpResponse<T>, D = any>(
		url: string,
		data?: D,
		config: MethodConfig = {}
	): Promise<R> {
		return this.request<T, R>({
			...config,
			data,
			method: config.method ?? 'post',
			url
		});
	}

	public put<T = any, R = HttpResponse<T>, D = any>(
		url: string,
		data?: D,
		config?: MethodConfig
	): Promise<R>;
	public put<T = any, R = HttpResponse<T>, D = any>(
		url: string,
		data?: D,
		config: MethodConfig = {}
	): Promise<R> {
		return this.request<T, R>({
			...config,
			data,
			method: config.method ?? 'put',
			url
		});
	}

	public async request<T = any, R = HttpResponse<T>>(config: RequestConfig): Promise<R> {
		let timeoutId: number | undefined;
		const timeout = config.timeout ?? this.timeout;
		if (timeout) {
			config.controller ??= new AbortController();

			timeoutId = setTimeout(() => {
				if (config.controller) {
					config.controller.abort(new TimeoutError(config.url, config.method));
				}
			}, timeout) as unknown as number;
		}

		const _config = await normalizeRequest({
			baseUrl: this.baseUrl,
			config: config as NormalizeRequestConfig,
			defaultHeaders: this.defaultHeaders,
			interceptors: this.interceptors,
			setToken: this._setToken
		});

		const request = new Request(_config.url, _config);

		let requestPromise = this.generatePromise(request, _config, timeoutId);

		this.interceptors.response.values.forEach(({ onResponse, onResponseError }) => {
			requestPromise = requestPromise.then(onResponse, (error): Promise<HttpResponseError<any>> => {
				if (onResponseError && !isAbortedError(error)) {
					return onResponseError(error);
				}
				throw error;
			});
		});

		return await requestPromise as R;
	}

	public setToken(cb: InterceptorOnRequest) {
		this._setToken = cb;
	}

	public upload<T = any, R = HttpResponse<T>, D = any>(
		method: 'POST' | 'PUT',
		url: string,
		files: File[],
		data?: D,
		config?: Omit<MethodConfig, 'method'>,
		formDataKey?: string
	): Promise<R>;
	// eslint-disable-next-line max-params
	public upload<T = any, R = HttpResponse<T>, D = any>(
		method: 'POST' | 'PUT',
		url: string,
		files: File[],
		data?: D,
		config: Omit<MethodConfig, 'method'> = {},
		formDataKey?: string
	): Promise<R> {
		return this.request<T, R>({
			...config,
			data: formatToFormData(files, data, formDataKey),
			method,
			url
		});
	}

	protected _setToken: InterceptorOnRequest = (config) => config;

	private async generatePromise(
		request: Request,
		config: HttpResponseConfig,
		timeoutId?: number
	) {
		try {
			const _response = await fetch(request);

			clearTimeout(timeoutId);

			const response = _response.clone();

			const isJson = response.headers.get('content-type')?.includes('application/json');

			const data = await (config.transform
				? config.transform(_response.clone(), config)
				: (isJson
					? response.json()
					: response.text()));

			if (_response.ok) {
				return new HttpResponse(
					request,
					config,
					data,
					response
				);
			}

			return await Promise.reject(
				new HttpResponseError(
					request,
					config,
					data,
					response
				)
			);
		}
		catch (error) {
			clearTimeout(timeoutId);
			return await Promise.reject(
				error instanceof HttpResponseError
					? error
					: new HttpResponseError(
						request,
						config,
						error
					)
			);
		}
	}

	private throttleRequest(
		cacheKey: string,
		threshold: number,
		cb: () => Promise<any>
	) {
		return throttlePromise(cacheKey, cb, threshold);
	}
}
