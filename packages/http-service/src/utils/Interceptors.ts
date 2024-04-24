import { type FetchError } from '../errors/FetchError'

import { type HttpResponseConfig, type HttpResponse, type HttpResponseError } from './HttpResponse'

export type Interceptors<Config, Error = any> = {
	error: (error: Error) => Promise<Error>
	on: (config: Config) => Config
}

export type InterceptorOnRequest = (config: HttpResponseConfig) => HttpResponseConfig | Promise<HttpResponseConfig>;
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

export type InterceptorOnResponse<D> = (data: HttpResponse<D>) => any | Promise<any>
export type InterceptorOnResponseError = <E = any>(config: HttpResponseError<E>) => Promise<HttpResponseError<E>>

type InterceptorResponse = {
	use: <D>(
		onResponse: InterceptorOnResponse<D>,
		onResponseError?: InterceptorOnResponseError
	) => () => void
	values: Array<{
		onResponse: InterceptorOnResponse<any>
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
			use: function <D>(
				onResponse: InterceptorOnResponse<D>,
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
