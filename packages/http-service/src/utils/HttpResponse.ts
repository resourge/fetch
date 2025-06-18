import { type RequestConfig } from '../types';

export type HttpResponseConfig = Omit<RequestConfig, 'url' | 'headers' | 'controller'> & {
	url: URL
} & Required<Pick<RequestConfig, 'headers'>>
& Pick<RequestInit, 'signal'>

export class HttpResponse<T = any> {
	public status: number;

	constructor(
		public request: Request,
		public config: HttpResponseConfig,
		public data: T,
		public response: Response
	) {
		this.status = response.status;
	}
}

export class HttpResponseError<T = any> extends Error {
	constructor(
		public request: Request,
		public config: HttpResponseConfig,
		public data: T,
		public response?: Response,
		public status?: number
	) {
		super();
		this.name = 'HttpResponseError'

		Error.captureStackTrace(this, HttpResponseError);

		this.message = `[${response ? 'RESPONSE' : 'REQUEST'}] ${status !== undefined ? `[${status}] ` : ''}${JSON.stringify(this)}`
	}
}
