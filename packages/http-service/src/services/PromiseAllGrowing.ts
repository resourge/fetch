type PromisePoolType = 'useEffect' | 'request' | 'fetch'

type PromisePoolValueType = {
	pending: Set<Promise<any>>
	waiters: Array<(...args: any[]) => any>
}

export class PromiseAllGrowing {
	private readonly pools: Record<PromisePoolType, PromisePoolValueType> = {
		useEffect: {
			pending: new Set<Promise<any>>(),
			waiters: []
		},
		request: {
			pending: new Set<Promise<any>>(),
			waiters: []
		},
		fetch: {
			pending: new Set<Promise<any>>(),
			waiters: []
		}
	} 

	async promise<T>(pool: PromisePoolType, p: () => Promise<T>): Promise<T> {
		const tracked = p()

		this.pools[pool].pending.add(tracked);

		const [re] = await Promise.all([
			tracked
			.finally(() => {
				this.pools[pool].pending.delete(tracked);
				this.check(pool);
			}),
			this.waitAll(pool)
		]);

		return re;
	}

	public waitAll(pool: PromisePoolType) {
		return new Promise((resolve) => {
			this.pools[pool].waiters.push(resolve);
			this.check(pool);
		});
	}

	private check(pool: PromisePoolType) {
		if (this.pools[pool].pending.size === 0 && this.pools[pool].waiters.length > 0) {
			this.pools[pool].waiters.forEach(resolve => {
				resolve(); 
			});
			this.pools[pool].waiters = [];
		}
	}
};
