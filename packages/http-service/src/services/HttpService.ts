import { FetchResponseError } from '../errors/FetchError';
import { RequestConfig } from '../types/RequestConfig';
import { Interceptor, ResponseConfig } from '../utils/Interceptors';
import { formatToFormData } from '../utils/formatToFormData';
import { getCacheKey } from '../utils/getCacheKey';
import { normalizeRequest, NormalizeRequestConfig } from '../utils/normalizeHeaders';
import { throttlePromise } from '../utils/throttlePromise';
import { convertParamsToQueryString } from '../utils/transformURLSearchParams';

export type MethodConfig = Omit<RequestConfig, 'url'> & {
	method?: string
}

export type GetMethodConfig = Omit<RequestConfig, 'url' | 'method'> & {
	method?: string
	/**
	 * Throttle threshold
	 */
	threshold?: number
}

/**
 * Main service to make the requests to the server
 * It's a simple wrapper on Fetch api, adding throttle to get's
 * and the upload method.
 */
export class HttpServiceClass {
	public baseUrl: string = window.location.origin;

	public interceptors = new Interceptor()

	private throttleRequest(
		cacheKey: string,
		threshold: number,
		cb: () => Promise<any>
	) {
		return throttlePromise(cacheKey, cb, threshold)
	}

	public request<T = any, R = ResponseConfig<T>>(config: RequestConfig): Promise<R> {
		if ( typeof config.url === 'string' ) {
			config.url = new URL(config.url, this.baseUrl)
		}
		config.url.searchParams.sort();

		const _config: RequestConfig = normalizeRequest(
			config as NormalizeRequestConfig,
			this.interceptors
		);

		let request = (async () => {
			const _response = await fetch(_config.url, _config);
			const response = _response.clone();

			if ( _response.ok ) {
				const data = await (config.transform ? config.transform(_response.clone(), config) : response.json());
				return Object.assign(response, {
					data
				})
			}

			return await Promise.reject(
				new FetchResponseError(
					_response,
					await _response.text()
				)
			);
		})();

		this.interceptors.response.values.forEach(({ onResponse, onResponseError }) => {
			request = request.then(onResponse, onResponseError)
		})

		return request as Promise<R>;
	}

	public async get<T = any, R = ResponseConfig<T>>(url: string): Promise<R>;
	public async get<T = any, R = ResponseConfig<T>>(url: string, params: undefined, config: GetMethodConfig): Promise<R>;
	public async get<T = any, R = ResponseConfig<T>, K extends object | any[] = any>(url: string, params: K): Promise<R>;
	public async get<T = any, R = ResponseConfig<T>, K extends object | any[] = any>(url: string, params: K, config: GetMethodConfig): Promise<R>;
	public async get<T = any, R = ResponseConfig<T>, K extends object | any[] = any>(url: string, params?: K, config?: GetMethodConfig): Promise<R> {
		const _url = new URL(url, this.baseUrl);

		if ( params ) {
			const urlSearchParams = convertParamsToQueryString(params);

			urlSearchParams.sort();

			_url.search = urlSearchParams.toString();
		}

		const threshold = config?.threshold ?? 1000;
		
		const _config: NormalizeRequestConfig = {
			...config,
			method: config?.method ?? 'get',
			url: _url
		}

		// Get throttle cache key
		const cacheKey = getCacheKey(_config);

		return await this.throttleRequest(
			cacheKey,
			threshold,
			() => {
				return this.request(_config);
			}
		);
	}

	public post<T = any, R = ResponseConfig<T>, K = any>(
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

	public put<T = any, R = ResponseConfig<T>, K = any>(
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

	public delete<T = any, R = ResponseConfig<T>, K = any>(
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

	public patch<T = any, R = ResponseConfig<T>, K = any>(
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

	public upload<T = any, R = ResponseConfig<T>, K = any>(
		method: 'POST' | 'PUT',
		url: string,
		files: File[],
		data?: K,
		config?: MethodConfig
	): Promise<R> {
		const _config: RequestConfig = {
			...config,
			method: config?.method ?? method,
			url,
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			data: formatToFormData(files, data)
		}

		return this.request<T, R>(_config);
	}
}

let httpService = new HttpServiceClass();

/**
 * Method to update default HttpService to different standards.
 */
export const setDefaultHttpService = (http: HttpServiceClass) => {
	httpService = http;
}

/**
 * Main service to make the requests to the server.
 * * Note: All request need to pass throw this to useFetch/useFetchCallback
 * * to work as intended.
 */
const HttpService: HttpServiceClass = new Proxy(httpService, {
	get(_, p: keyof HttpServiceClass) {
		return httpService[p]
	}
});

export default HttpService
