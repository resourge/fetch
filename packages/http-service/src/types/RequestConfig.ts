export type RequestConfig = Omit<RequestInit, 'body' | 'method' | 'headers'> & {
	method: string
	url: URL | string
	data?: any
	headers?: Record<string, string>
	transform?: (response: Response, request: RequestConfig) => Promise<any>
}
