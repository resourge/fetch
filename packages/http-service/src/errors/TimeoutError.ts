export class TimeoutError extends Error {
	constructor(
		url: string | URL,
		method: string
	) {
		super(`Request, (${method.toUpperCase()}) ${typeof url === 'string'
			? url
			: url.href}, exceeded the timeout amount`);
		this.name = 'TimeoutError';
	}
}
