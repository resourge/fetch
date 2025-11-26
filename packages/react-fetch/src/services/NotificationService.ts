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

const notifications = new Map<string, NotificationType>();

const NotificationService = {
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
		notifications.forEach(({ notification }) => {
			notification();
		})
	},
	notifyById(id: string) {
		const notification = notifications.get(id);
		if ( notification ) {
			notification.notification();
		}
	}
}

export default NotificationService;
