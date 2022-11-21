import { FetchError } from '../errors/FetchError'
import { RequestConfig } from '../types/RequestConfig'

import { HttpResponse, HttpResponseError } from './HttpResponse'

export type Interceptors<Config, Error = any> = {
	error: (error: Error) => Promise<Error>
	on: (config: Config) => Config
}

export type InterceptorOnRequest = (config: RequestConfig) => RequestConfig;
export type InterceptorOnRequestError = (error: FetchError) => any;

type InterceptorRequest = {
	use: (
		onRequest: InterceptorOnRequest,
		onRequestError?: InterceptorOnRequestError
	) => () => void
	values: Array<{
		onRequest: InterceptorOnRequest
		onRequestError?: InterceptorOnRequestError
	}>
}

export type InterceptorOnResponse = <D>(data: HttpResponse<D>) => any
export type InterceptorOnResponseError = <E = any>(config: HttpResponseError<E>) => Promise<HttpResponseError<E>>

type InterceptorResponse = {
	use: (
		onResponse: InterceptorOnResponse,
		onResponseError?: InterceptorOnResponseError
	) => () => void
	values: Array<{
		onResponse: InterceptorOnResponse
		onResponseError?: InterceptorOnResponseError
	}>
}

/**
 * Request's Interceptor for request or responses.
 */
export class Interceptor {
	public request: InterceptorRequest;
	public response: InterceptorResponse;

	static clone(interceptor: Interceptor) {
		const newInterceptor = new Interceptor();

		newInterceptor.request = {
			...interceptor.request
		}
		newInterceptor.request.values = [...newInterceptor.request.values];

		newInterceptor.response = {
			...interceptor.response
		}
		newInterceptor.response.values = [...newInterceptor.response.values];

		return newInterceptor;
	}

	constructor() {
		this.request = {
			values: [],
			use: function (
				onRequest: InterceptorOnRequest,
				onRequestError?: InterceptorOnRequestError
			) {
				const obj = {
					onRequest,
					onRequestError
				}
				this.values.push(obj);
	
				return () => {
					this.values = this.values.filter((val) => val !== obj);
				}
			}
		}
		this.response = {
			values: [],
			use: function (
				onResponse: InterceptorOnResponse,
				onResponseError?: InterceptorOnResponseError
			) {
				const obj = {
					onResponse,
					onResponseError
				}
				this.values.push(obj);
	
				return () => {
					this.values = this.values.filter((val) => val !== obj);
				}
			}
		}
	}
}
