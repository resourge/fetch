import { type RequestConfig } from '../types';

export type HttpResponseConfig = Omit<RequestConfig, 'url' | 'headers' | 'controller'> & {
	url: URL
} & Required<Pick<RequestConfig, 'headers'>>
& Pick<RequestInit, 'signal'>

export class HttpResponse<T = any> {
	constructor(
		public status: number,
		public message: string,

		public request: Request,
		public response: Response,
		public data: T,
		public config: HttpResponseConfig
	) {}
}

export class HttpResponseError<T = any> {
	constructor(
		public message: string,

		public request: Request,
		public data: T,
		public config: HttpResponseConfig,
		public status?: number,
		public response?: Response
	) {}
}
