import { createUrl } from '../utils';

describe('utils', () => {
	const origin = 'http://localhost';

	it('should createUrl return an url', () => {
		const newUrl = new URL('api', origin);

		// expect(createUrl(newUrl, origin).href).toBe('http://localhost/api')

		// expect(createUrl('api', origin).href).toBe('http://localhost/api')

		console.log('href', createUrl(newUrl.href, origin).href)

		expect(createUrl(newUrl.href, origin).href).toBe('http://localhost/api')
	})
})
