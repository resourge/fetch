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

type NotificationType<Result> = {
	data: State<Result>
	
	request: () => Promise<any>
}

const requestNotification = new Map<string, Promise<any>>();
let notifications: Array<() => void> = [];
const fetchData = new Map<string, NotificationType<any>>();

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

	startNotification<Result>(
		id: string,
		stateConfig: StateConfig<Result>
	) {
		const newNotification: NotificationType<Result> = {
			request: stateConfig.request,
			data: {
				data: (
					typeof stateConfig.initialState === 'function' 
						? (stateConfig.initialState as () => Result)()
						: stateConfig.initialState
				),
				isLoading: stateConfig.isFetchEffect || stateConfig.isFetchEffectWithData,
				error: null
			}
		};

		fetchData.set(
			id, 
			newNotification
		);

		return newNotification;
	},

	getData<Result, >(
		id: string
	): NotificationType<Result> {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return fetchData.get(id)!;
	},

	setState(id: string, data: Partial<State<any>>) {
		const notification = fetchData.get(id);

		if ( notification ) {
			notification.data = {
				data: notification.data.data,
				isLoading: notification.data.isLoading,
				error: notification.data.error,
				...data
			}
			fetchData.set(id, notification);
		}
	},
	subscribe(notification: () => void) {
		notifications = [...notifications, notification];
		return () => {
			notifications = notifications.filter(l => l !== notification);
		};
	},

	notifyAll() {
		if ( requestNotification.size === 0 ) {
			notifications.forEach((notification) => {
				notification();
			})
		}
	},

	requestAllAgain(filter?: (id: string) => boolean) {
		if ( fetchData.size ) {
			fetchData.forEach(({ request }, key) => {
				if ( !filter || filter(key) ) {
					request();
				}
			})
		}
	}
}

export default NotificationService;
