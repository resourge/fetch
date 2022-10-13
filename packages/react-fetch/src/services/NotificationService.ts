class NotificationService {
	public requestNotification = new Set<string>();
	public notifications = new Map<string, () => void>();

	public startRequest(id: string) {
		this.requestNotification.add(id);
	}

	public finishRequest(id: string) {
		this.requestNotification.delete(id);
	}

	public subscribe = (id: string, notification: () => void) => {
		this.notifications.set(id, notification);

		return () => {
			this.finishRequest(id);
			this.notifications.delete(id);
		}
	}

	public notify(id: string) {
		const notify = this.notifications.get(id);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		notify!();
	}

	public notifyAll() {
		if ( this.requestNotification.size === 0 ) {
			this.notifications.forEach((notify) => {
				notify();
			})
		}
	}
}

export default new NotificationService();
