import { type FetchError, type HttpResponseError } from '../../../http-service/src'

export type UseFetchError = HttpResponseError | FetchError | Error | null | any

export type State<T> = {
	data: T
	error: UseFetchError
	isLoading: boolean
}

type NotificationType = {
	notification: () => void
}

const requestNotification = new Set<string>();
const notifications = new Map<string, NotificationType>();

const NotificationService = {
	startRequest(id: string) {
		requestNotification.add(id);
	},
	finishRequest(id: string) {
		requestNotification.delete(id);
	},
	subscribe(id: string) {
		return (notification: () => void) => {
			notifications.set(id, {
				notification
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
	}
}

export default NotificationService;
