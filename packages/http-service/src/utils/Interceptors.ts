import { type FetchError } from '../errors/FetchError';

import { type HttpResponse, type HttpResponseConfig, type HttpResponseError } from './HttpResponse';

type InterceptorRequest = {
	use: (
		onRequest: InterceptorOnRequest,
		onRequestError?: InterceptorOnRequestError
	) => () => void
	values: Array<{
		onRequest: InterceptorOnRequest
		onRequestError?: InterceptorOnRequestError
	}>
};

type InterceptorResponse = {
	use: <D>(
		onResponse: InterceptorOnResponse<D>,
		onResponseError?: InterceptorOnResponseError
	) => () => void
	values: Array<{
		onResponse: InterceptorOnResponse<any>
		onResponseError?: InterceptorOnResponseError
	}>
};

export type InterceptorOnRequest = (config: HttpResponseConfig) => HttpResponseConfig | Promise<HttpResponseConfig>;

export type InterceptorOnRequestError = (error: FetchError) => any;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type InterceptorOnResponse<D> = (data: HttpResponse<D>) => any | Promise<any>;

export type InterceptorOnResponseError = <E = any>(config: HttpResponseError<E>) => Promise<HttpResponseError<E>>;

export type Interceptors<Config, Error = any> = {
	error: (error: Error) => Promise<Error>
	on: (config: Config) => Config
};

/**
 * Request's Interceptor for request or responses.
 */
export class Interceptor {
	public request: InterceptorRequest;
	public response: InterceptorResponse;

	constructor() {
		this.request = {
			use: function (
				onRequest: InterceptorOnRequest,
				onRequestError?: InterceptorOnRequestError
			) {
				const obj = {
					onRequest,
					onRequestError
				};
				this.values.push(obj);

				return () => {
					this.values = this.values.filter((val) => val !== obj);
				};
			},
			values: []
		};
		this.response = {
			use: function <D>(
				onResponse: InterceptorOnResponse<D>,
				onResponseError?: InterceptorOnResponseError
			) {
				const obj = {
					onResponse,
					onResponseError
				};
				this.values.push(obj);

				return () => {
					this.values = this.values.filter((val) => val !== obj);
				};
			},
			values: []
		};
	}
}
