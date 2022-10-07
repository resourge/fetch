export class FetchError extends Error {
	static setFromError(error: Error) {
		const f = new FetchError(error.message);

		f.cause = error.cause;
		f.message = error.message;
		f.stack = error.stack;

		return f;
	}
	
	constructor(message: string) {
		super(message)
		this.name = 'FetchError';
	}
}

export class FetchResponseError extends FetchError {
	public status: number
	public response: Response

	constructor(response: Response, message?: string) {
		super(message ?? response.statusText)

		this.status = response.status;
		this.response = response;
		this.name = 'FetchResponseError';
	}
}
