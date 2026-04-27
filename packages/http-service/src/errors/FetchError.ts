export class FetchError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'FetchError';
	}

	static setFromError(error: Error) {
		const f = new FetchError(error.message);

		f.cause = error.cause;
		f.stack = error.stack;

		return f;
	}
}
