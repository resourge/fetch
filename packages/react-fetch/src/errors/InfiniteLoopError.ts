export class InfiniteLoopError extends Error {
	constructor(message: string) {
		super(`Watch out for a infinite loop in ${message}`)
		this.name = 'InfiniteLoopError';
	}
}
