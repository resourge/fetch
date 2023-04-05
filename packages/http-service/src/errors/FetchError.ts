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

		Error.captureStackTrace(this, FetchError);
	}
}
