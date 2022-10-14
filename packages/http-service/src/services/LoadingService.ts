import { LoadingError } from '../errors/LoadingError';

type LoadingServiceEvent = {
	emits: Array<() => void>
	isLoading: boolean
	nFetch: number
}
/**
 * Simple Service to show/hide the loading.
 */
class LoadingService {
	private readonly events: Map<string, LoadingServiceEvent> = new Map();

	constructor() {
		this.events = new Map();
	}

	public getLoading(loaderId: string = ''): boolean {
		const event = this.events.get(loaderId);
		if ( event ) {
			return event.isLoading
		}
		return false;
	};

	/**
	 * Add event listened to loaderId.
	 * @params loaderId @default ''
	 */
	public addListener(loaderId: string = '', onEmit: () => void) {
		const obj = this.events.get(loaderId) ?? { 
			isLoading: false, 
			nFetch: 0, 
			emits: [] 
		}

		obj.emits.push(onEmit)

		this.events.set(loaderId, obj);
		
		return () => {
			const event = this.events.get(loaderId)
			if ( event ) {
				const index = event.emits.findIndex(onEmit);

				if ( index > -1 ) {
					event.emits.slice(index, 1);

					if ( event.emits.length ) {
						this.events.set(loaderId, event);
					}
					else {
						this.events.delete(loaderId);
					}
				}
			}
		};
	}

	/**
	 * Triggers show event listeners on loaderId
	 * @param loaderId @default ''
	 */
	public show(loaderId: string = '') {
		this.setLoading(loaderId, true)
	}
	
	/**
	 * Triggers hide event listeners on loaderId
	 * @param loaderId @default ''
	 */
	public hide(loaderId: string = '') {
		this.setLoading(loaderId, false)
	}

	protected emit(emits: Array<() => void>) {
		if ( emits && emits.length ) {
			emits
			.forEach((emit) => {
				emit();
			})
		}
	}

	protected setLoading(loaderId: string = '', isLoading: boolean) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const event = this.events.get(loaderId)!;
		if ( __DEV__ ) {
			if ( !event ) {
				throw new LoadingError(loaderId)
			}
		}

		let {
			nFetch, emits
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		} = event;

		if ( isLoading ) {
			if ( nFetch <= 0 ) {
				event.isLoading = isLoading;
				this.emit(emits);
			}
			nFetch++;
		}
		else {
			if ( nFetch > 0 ) {
				nFetch--;
			}
			if ( nFetch <= 0 ) {
				event.isLoading = isLoading;
				this.emit(emits);
			}
		}
		
		this.events.set(
			loaderId, 
			{
				isLoading: event?.isLoading ?? false,
				nFetch,
				emits 
			}
		);
	}
}
export default new LoadingService();
