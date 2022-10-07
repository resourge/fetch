export class MultipleHttpProviderError extends Error {
	constructor() {
		super('Provide only one \'HttpProvider\'.');
		
		this.name = 'MultipleHttpProviderError';
	}
}
