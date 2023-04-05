export class LoadingError extends Error {
	constructor(loaderId: string) {
		super(`Can't loading to '${loaderId}', because "<Loading name={'${loaderId}'}>..." doesn't exist.`);

		this.name = 'LoadingError'

		Error.captureStackTrace(this, LoadingError);
	}
}
