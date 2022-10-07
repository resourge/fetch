export class TriggerWithoutHttpProviderError extends Error {
	constructor() {
		super('useFetchCallback \'trigger\' cannot be used without HttpProvider or HttpContext');

		this.name = 'TriggerWithoutHttpProviderError'
	}
}
