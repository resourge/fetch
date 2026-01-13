type PromisePoolType = 'useEffect' | 'request' | 'fetch'

type PromisePoolValueType = {
	p: Promise<any>
	pending: Set<Promise<any>>
	waiters: Array<(...args: any[]) => any>
}

export class PromiseAllGrowing {
	private readonly pools: Record<PromisePoolType, PromisePoolValueType> = {
		useEffect: {
			pending: new Set<Promise<any>>(),
			waiters: [],
			p: Promise.resolve()
		},
		request: {
			pending: new Set<Promise<any>>(),
			waiters: [],
			p: Promise.resolve()
		},
		fetch: {
			pending: new Set<Promise<any>>(),
			waiters: [],
			p: Promise.resolve()
		}
	} 

	async promise<T>(key: PromisePoolType, p: () => Promise<T>): Promise<T> {
		const tracked = p()

		const pool = this.pools[key];
		pool.pending.add(tracked);

		pool.p = Promise.all([
			tracked
			.finally(() => {
				pool.pending.delete(tracked);
				this.check(pool);
			}),
			this.waitAll(pool)
		])

		const [re] = await pool.p;

		return re;
	}

	public waitAll(pool: PromisePoolValueType) {
		const oldP = pool.p;
		return new Promise<void>((resolve) => {
			pool.waiters.push(async () => {
				await oldP;
				resolve();
			});
			this.check(pool);
		});
	}

	private check(pool: PromisePoolValueType) {
		if (pool.pending.size === 0 && pool.waiters.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			pool.waiters.forEach(async (resolve) => {
				await resolve(); 
			});
			pool.p = Promise.resolve()
			pool.waiters = [];
		}
	}
};
