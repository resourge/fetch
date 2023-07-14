export class ScrollRestorationIdIsUndefined extends Error {
	constructor() {
		super(
			'\'scrollRestorationId\' cannot be undefined has it is used and an unique id.' +
			'By default in browser environment it will use current pathname as id.' +
			'But in other environment\'s is necessary to set it'
		);

		this.name = 'ScrollRestorationIdIsUndefined'

		Error.captureStackTrace(this, ScrollRestorationIdIsUndefined);
	}
}
