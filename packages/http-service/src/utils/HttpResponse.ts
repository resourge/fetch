import { type RequestConfig } from '../types';

export class HttpResponse<T = any> {
	constructor(
		public status: number,
		public message: string,

		public request: Request,
		public response: Response,
		public data: T,
		public config: RequestConfig
	) {}
}

export class HttpResponseError<T = any> {
	constructor(
		public message: string,

		public request: Request,
		public data: T,
		public config: RequestConfig,
		public status?: number,
		public response?: Response
	) {}
}
