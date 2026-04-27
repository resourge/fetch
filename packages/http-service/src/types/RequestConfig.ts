export type RequestConfig = Omit<RequestInit, 'body' | 'headers' | 'method' | 'signal'> & {
	/**
	 * Controller to abort requests
	 */
	controller?: AbortController
	data?: any
	headers?: Record<string, string>
	method: string
	/**
	 * Aborts the request when the time expires
	 * @default 0
	 */
	timeout?: number
	transform?: (response: Response, request: RequestConfig) => Promise<any>
	url: string | URL
};
