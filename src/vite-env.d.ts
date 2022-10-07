/// <reference types="vite/client" />
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpServiceClass } from 'packages/http-service/src'

declare module 'packages/http-service/src' {
	interface HttpServiceClass {
		test: ''
	}
}
