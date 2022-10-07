export class MissingBaseUrlError extends Error {
	constructor() {
		super('In systems not browser, \'baseUrl\' is mandatory.');

		this.name = 'MissingBaseUrlError'
	}
}
