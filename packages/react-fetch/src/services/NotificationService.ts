import { type FetchError, type HttpResponseError } from '../../../http-service/src';

type NotificationType = {
	notification: () => void
};

export type State<T> = {
	data: T
	error: UseFetchError
	isLoading: boolean
};

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type UseFetchError = any | Error | FetchError | HttpResponseError | null;

const requestNotification = new Set<string>();
const notifications = new Map<string, NotificationType>();

const NotificationService = {
	finishRequest(id: string) {
		requestNotification.delete(id);
	},
	notifyAll() {
		if (requestNotification.size === 0) {
			notifications.forEach(({ notification }) => {
				notification();
			});
		}
	},
	notifyById(id: string) {
		const notification = notifications.get(id);
		if (notification) {
			notification.notification();
		}
	},
	startRequest(id: string) {
		requestNotification.add(id);
	},
	subscribe(id: string) {
		return (notification: () => void) => {
			notifications.set(id, {
				notification
			});
			return () => {
				notifications.delete(id);
			};
		};
	}
};

export default NotificationService;
