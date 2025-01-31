export type RequestConfig = Omit<RequestInit, 'body' | 'method' | 'headers' | 'signal'> & {
	method: string
	url: URL | string
	/**
	 * Controller to abort requests
	 */
	controller?: AbortController
	data?: any
	headers?: Record<string, string>
	/**
	 * Aborts the request when the time expires
	 * @default 0
	 */
	timeout?: number
	transform?: (response: Response, request: RequestConfig) => Promise<any>
}
