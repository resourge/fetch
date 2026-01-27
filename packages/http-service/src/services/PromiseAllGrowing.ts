type PromisePoolType = 'chain' | 'no-chain'

type PromisePoolValueType = {
	p: Promise<any>
	pending: Set<Promise<any>>
	waiters: Array<(...args: any[]) => any>
}

export class PromiseAllGrowing {
	private readonly pool: PromisePoolValueType = {
		pending: new Set<Promise<any>>(),
		waiters: [],
		p: Promise.resolve()
	} 

	async promise<T>(key: PromisePoolType, p: () => Promise<T>): Promise<T> {
		const tracked = p()

		if ( key === 'no-chain' ) {
			return await tracked
		}

		this.pool.pending.add(tracked);

		this.pool.p = Promise.all([
			tracked
			.finally(() => {
				this.pool.pending.delete(tracked);
				this.check();
			}),
			this.waitAll()
		])

		const [re] = await this.pool.p;

		return re;
	}

	public waitAll() {
		const oldP = this.pool.p;
		return new Promise<void>((resolve) => {
			this.pool.waiters.push(async () => {
				await oldP;
				resolve();
			});
			this.check();
		});
	}

	private check() {
		if (this.pool.pending.size === 0 && this.pool.waiters.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			this.pool.waiters.forEach(async (resolve) => {
				await resolve(); 
			});
			this.pool.p = Promise.resolve()
			this.pool.waiters = [];
		}
	}
};
