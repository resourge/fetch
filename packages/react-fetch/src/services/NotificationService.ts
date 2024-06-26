import { type FetchError, type HttpResponseError } from '../../../http-service/src'

export type UseFetchError = HttpResponseError | FetchError | Error | null | any

export type State<T> = {
	data: T
	error: UseFetchError
	isLoading: boolean
}

export type StateConfig<Result> = {
	initialState: Result | (() => Result)
	isFetchEffect: boolean
	isFetchEffectWithData: boolean
	
	request: () => Promise<any>
}

type NotificationType = {
	notification: () => void
	request: () => Promise<any>
}

const requestNotification = new Map<string, Promise<any>>();
const notifications = new Map<string, NotificationType>();

const NotificationService = {
	getRequest(id: string) {
		return requestNotification.get(id);
	},
	startRequest(id: string, prom: Promise<any>) {
		requestNotification.set(id, prom);
	},
	finishRequest(id: string) {
		requestNotification.delete(id);
	},
	
	subscribe(id: string, request: () => Promise<any>) {
		return (notification: () => void) => {
			notifications.set(id, {
				notification,
				request
			})
			return () => {
				notifications.delete(id)
			}
		};
	},
	notifyAll() {
		if ( requestNotification.size === 0 ) {
			notifications.forEach(({ notification }) => {
				notification();
			})
		}
	},
	notifyById(id: string) {
		const notification = notifications.get(id);
		if ( notification ) {
			notification.notification();
		}
	},
	requestAllAgain(filter?: (id: string) => boolean) {
		if ( notifications.size ) {
			notifications.forEach(({ request }, key) => {
				if ( !filter || filter(key) ) {
					request();
				}
			})
		}
	}
}

export default NotificationService;
