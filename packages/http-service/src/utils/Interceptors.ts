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
	values: Set<{
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
	values: Set<{
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

		newInterceptor.response = {
			...interceptor.response
		}

		return newInterceptor;
	}

	constructor() {
		this.request = {
			values: new Set(),
			use: function (
				onRequest: InterceptorOnRequest,
				onRequestError?: InterceptorOnRequestError
			) {
				const obj = {
					onRequest,
					onRequestError
				}
				this.values.add(obj);
	
				return () => {
					this.values.delete(obj);
				}
			}
		}
		this.response = {
			values: new Set(),
			use: function (
				onResponse: InterceptorOnResponse,
				onResponseError?: InterceptorOnResponseError
			) {
				const obj = {
					onResponse,
					onResponseError
				}
				this.values.add(obj);
	
				return () => {
					this.values.delete(obj);
				}
			}
		}
	}
}
