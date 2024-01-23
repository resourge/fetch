import { type RequestConfig } from '../types/RequestConfig';
import { HttpResponse, HttpResponseError } from '../utils/HttpResponse';
import { Interceptor, type InterceptorOnRequest } from '../utils/Interceptors';
import { formatToFormData } from '../utils/formatToFormData';
import { getCacheKey } from '../utils/getCacheKey';
import { normalizeRequest, type NormalizeRequestConfig } from '../utils/normalizeHeaders';
import { throttlePromise } from '../utils/throttlePromise';
import { convertParamsToQueryString } from '../utils/transformURLSearchParams';
import { createUrl } from '../utils/utils';

import QueueKingSystem from './QueueKingSystem';

export type MethodConfig = Omit<RequestConfig, 'url'> & {
	method?: string
}

export type HttpServiceDefaultConfig = {
	/**
	 * If threshold is enabled
	 */
	isThresholdEnabled: boolean
	/**
	 * Default threshold for get request @default 2750 milliseconds
	 */
	threshold: number
}

export type BaseRequestConfig = Partial<HttpServiceDefaultConfig> & {
	/**
	 * A signal object that allows you to communicate with a DOM request (such as a Fetch) and abort it if required via an AbortController object.
	 */
	signal?: AbortSignal
}

export type GetMethodConfig = Omit<RequestConfig, 'url' | 'method'> & {
	method?: string
	/**
	 * Throttle key
	 */
	throttleKey?: string
} & BaseRequestConfig

export type HttpServiceConfig = {
	baseUrl?: string
}

/**
 * Main service to make the requests to the server
 * It's a simple wrapper on Fetch api, adding throttle to get's
 * and the upload method.
 */
export abstract class BaseHttpService {
	public baseUrl: string = typeof window !== 'undefined' ? window.location.origin : '/';

	/**
	 * Default config of HttpService
	 */
	public defaultConfig: Omit<HttpServiceDefaultConfig, 'signal'> = {
		threshold: 2750,
		isThresholdEnabled: false
	}

	public interceptors = new Interceptor();

	constructor(config?: HttpServiceConfig) {
		this.baseUrl = config?.baseUrl ?? this.baseUrl;
	}

	private throttleRequest(
		cacheKey: string,
		threshold: number,
		cb: () => Promise<any>
	) {
		return throttlePromise(cacheKey, cb, threshold)
	}

	private async generatePromise(request: Request, config: RequestConfig) {
		let _response: Response
		try {
			_response = await fetch(request);
		}
		catch ( e ) {
			return await Promise.reject(
				new HttpResponseError(
					'Network Error',
					request,
					e,
					config
				)
			)
		}
		const response = _response.clone();

		const isJson = response.headers.get('content-type')?.includes('application/json');
		
		const data = await (config.transform ? config.transform(_response.clone(), config) : (isJson ? response.json() : response.text()));

		if ( _response.ok ) {
			return new HttpResponse(
				response.status,
				response.statusText,
				request,
				response,
				data,
				config
			);
		}

		return await Promise.reject(
			new HttpResponseError(
				response.statusText,
				request,
				data,
				config,
				response.status,
				response
			)
		);
	}

	protected _setToken: InterceptorOnRequest = (config) => config;
	public setToken(cb: InterceptorOnRequest) {
		this._setToken = cb;
	}

	public async request<T = any, R = HttpResponse<T>>(config: RequestConfig): Promise<R> {
		const _config = await normalizeRequest(
			config as NormalizeRequestConfig,
			this._setToken,
			this.interceptors,
			this.baseUrl
		);

		const request = new Request(_config.url, _config);

		let requestPromise = this.generatePromise(request, _config);

		this.interceptors.response.values.forEach(({ onResponse, onResponseError }) => {
			requestPromise = requestPromise.then(onResponse, onResponseError)
		})

		return await requestPromise as R;
	}

	public get<T = any, R = HttpResponse<T>>(url: string): Promise<R>;
	public get<T = any, R = HttpResponse<T>>(url: string, params: undefined, config: GetMethodConfig): Promise<R>;
	public get<T = any, R = HttpResponse<T>>(url: string, params: undefined, config?: GetMethodConfig): Promise<R>;
	public get<T = any, K extends object | any[] = any, R = HttpResponse<T>>(url: string, params: K): Promise<R>;
	public get<T = any, K extends object | any[] = any, R = HttpResponse<T>>(url: string, params: K, config: GetMethodConfig): Promise<R>;
	public get<T = any, K extends object | any[] = any, R = HttpResponse<T>>(url: string, params?: K, config?: GetMethodConfig): Promise<R> {
		const _url = createUrl(url, this.baseUrl);

		if ( params ) {
			const urlSearchParams = convertParamsToQueryString(params);

			urlSearchParams.sort();

			_url.search = urlSearchParams.toString();
		}

		if ( !config?.signal ) {
			const controller = new AbortController();

			if ( !config ) {
				config = {}
			}

			config.signal = controller.signal;

			QueueKingSystem.send(controller)
		}

		const threshold = (QueueKingSystem.isThresholdEnabled ?? config?.isThresholdEnabled ?? this.defaultConfig.isThresholdEnabled) 
			? (config?.threshold ?? this.defaultConfig.threshold) 
			: 0;

		const _config: NormalizeRequestConfig = {
			...config,
			method: config?.method ?? 'get',
			url: _url
		}

		// Get throttle cache key
		const cacheKey = config?.throttleKey ?? getCacheKey(_config);

		return this.throttleRequest(
			cacheKey,
			threshold,
			() => this.request(_config)
		);
	}

	public post<T = any, K = any, R = HttpResponse<T>>(
		url: string,
		data?: K,
		config?: MethodConfig
	): Promise<R> {
		const _config: RequestConfig = {
			...config,
			method: config?.method ?? 'post',
			url,
			data
		}

		return this.request<T, R>(_config);
	}

	public put<T = any, K = any, R = HttpResponse<T>>(
		url: string,
		data?: K,
		config?: MethodConfig
	): Promise<R> {
		const _config: RequestConfig = {
			...config,
			method: config?.method ?? 'put',
			url,
			data
		}

		return this.request<T, R>(_config);
	}

	public delete<T = any, K = any, R = HttpResponse<T>>(
		url: string,
		data?: K,
		config?: MethodConfig
	): Promise<R> {
		const _config: RequestConfig = {
			...config,
			method: config?.method ?? 'delete',
			url,
			data
		}

		return this.request<T, R>(_config);
	}

	public patch<T = any, K = any, R = HttpResponse<T>>(
		url: string,
		data?: K,
		config?: MethodConfig
	): Promise<R> {
		const _config: RequestConfig = {
			...config,
			method: config?.method ?? 'patch',
			url,
			data
		}

		return this.request<T, R>(_config);
	}

	public upload<T = any, K = any, R = HttpResponse<T>>(
		method: 'POST' | 'PUT',
		url: string,
		files: File[],
		data?: K,
		config?: Omit<MethodConfig, 'method'>,
		formDataKey?: string
	): Promise<R> {
		const _config: RequestConfig = {
			...config,
			method,
			url,
			data: formatToFormData(files, data, formDataKey)
		}

		return this.request<T, R>(_config);
	}
}
