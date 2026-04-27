import { type RequestConfig } from '../types';

export type HttpResponseConfig = Omit<RequestConfig, 'controller' | 'headers' | 'url'> & Pick<RequestInit, 'signal'> & Required<Pick<RequestConfig, 'headers'>> & {
	url: URL
};

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
		public response?: Response
	) {
		super();
		this.name = 'HttpResponseError';

		this.message = `[${response
			? 'RESPONSE'
			: 'REQUEST'}] ${response?.status === undefined
			? ''
			: `[${response?.status}] `}${JSON.stringify(this)}`;
	}
}
