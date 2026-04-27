type LoadingServiceEvent = {
	emits: Array<() => void>
	isLoading: boolean
	nFetch: number
};

/**
 * Simple Service to show/hide the loading.
 */
class LoadingService {
	private readonly events = new Map<string, LoadingServiceEvent>();

	constructor() {
		this.events = new Map();
	}

	/**
	 * Add event listened to loaderId.
	 * @params loaderId @default ''
	 */
	public addListener(loaderId: string = '', onEmit: () => void) {
		const obj = this.events.get(loaderId) ?? {
			emits: [],
			isLoading: false,
			nFetch: 0
		};

		obj.emits.push(onEmit);

		this.events.set(loaderId, obj);

		return () => {
			const event = this.events.get(loaderId);
			if (event) {
				const index = event.emits.indexOf(onEmit);

				if (index !== -1) {
					event.emits.slice(index, 1);

					if (event.emits.length > 0) {
						this.events.set(loaderId, event);
					}
					else {
						this.events.delete(loaderId);
					}
				}
			}
		};
	};

	public getLoading(loaderId: string = ''): boolean {
		const event = this.events.get(loaderId);
		return Boolean(event && event.isLoading);
	}

	/**
	 * Triggers hide event listeners on loaderId
	 * @param loaderId @default ''
	 */
	public hide(loaderId: string = '') {
		this.setLoading(loaderId, false);
	}

	/**
	 * Triggers show event listeners on loaderId
	 * @param loaderId @default ''
	 */
	public show(loaderId: string = '') {
		this.setLoading(loaderId, true);
	}

	protected emit(emits: Array<() => void>) {
		emits
		.forEach((emit) => {
			emit();
		});
	}

	protected setLoading(loaderId: string = '', isLoading: boolean) {
		const event = this.events.get(loaderId);
		if (event) {
			// eslint-disable-next-line prefer-const
			let { emits, nFetch } = event;

			if (isLoading) {
				if (nFetch <= 0) {
					event.isLoading = isLoading;
					this.emit(emits);
				}
				nFetch++;
			}
			else {
				if (nFetch > 0) {
					nFetch--;
				}
				if (nFetch <= 0) {
					event.isLoading = isLoading;
					this.emit(emits);
				}
			}

			this.events.set(
				loaderId,
				{
					emits,
					isLoading: event?.isLoading ?? false,
					nFetch
				}
			);
		}
	}
}

export default new LoadingService();
