class NotificationService {
	public requestNotification = new Map<string, Promise<any> | undefined>();
	public notifications = new Map<string, {
		notification: () => void
		request: () => void
	}>();

	public getRequest(id: string) {
		return this.requestNotification.get(id);
	}

	public startRequest(id: string, prom?: Promise<any>) {
		this.requestNotification.set(id, prom);
	}

	public finishRequest(id: string) {
		this.requestNotification.delete(id);
	}

	public subscribe = (id: string, notification: () => void, request: () => void) => {
		this.notifications.set(id, {
			notification,
			request
		});

		return () => {
			this.finishRequest(id);
			this.notifications.delete(id);
		}
	}

	public notify(id: string) {
		const result = this.notifications.get(id);
		if ( result ) {
			result.notification();
		}
	}

	public notifyAll() {
		if ( this.requestNotification.size === 0 ) {
			this.notifications.forEach(({ notification }) => {
				notification();
			})
		}
	}

	public requestAllAgain(filter?: (id: string) => boolean) {
		if ( this.notifications.size ) {
			this.notifications.forEach(({ request }, key) => {
				if ( !filter || filter(key) ) {
					request();
				}
			})
		}
	}
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new NotificationService();
