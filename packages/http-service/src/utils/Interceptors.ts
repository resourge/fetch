import { type FetchError } from '../errors/FetchError'
import { type RequestConfig } from '../types/RequestConfig'

import { type HttpResponse, type HttpResponseError } from './HttpResponse'

export type Interceptors<Config, Error = any> = {
	error: (error: Error) => Promise<Error>
	on: (config: Config) => Config
}

export type InterceptorRequestConfig = Omit<RequestConfig, 'headers'> & Required<Pick<RequestConfig, 'headers'>>

export type InterceptorOnRequest = (config: InterceptorRequestConfig) => InterceptorRequestConfig;
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
