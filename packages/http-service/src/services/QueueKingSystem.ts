type QueueCallback = (controller: AbortController) => void

/**
 * Serves to catch all signals and save them in there respective component
 */
class QueueKingSystem {
	private readonly queue: QueueCallback[] = []
	private readonly _isThresholdEnabled: Array<boolean | undefined> = []

	public get isThresholdEnabled() {
		const lastIndex = this._isThresholdEnabled.length - 1;

		if ( lastIndex > -1 ) {
			const _isThresholdEnabled = this._isThresholdEnabled[lastIndex]

			this._isThresholdEnabled.splice(lastIndex, 1)

			return _isThresholdEnabled;
		}

		return undefined;
	}

	public set isThresholdEnabled(_isThresholdEnabled: boolean | undefined) {
		this._isThresholdEnabled.push(_isThresholdEnabled);
	}

	private get king() {
		return this.queue[this.queue.length - 1];
	}

	add(cb: QueueCallback, onRemove?: QueueCallback) {
		let _controller: AbortController;
		this.queue.push((controller) => {
			_controller = controller;
			cb(_controller)
		})

		return () => {
			onRemove && onRemove(_controller);
			this.queue.filter((v) => v === cb)
		}
	}

	send(value: any) {
		const king = this.king;

		if ( king ) {
			king(value)
		}
	}
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new QueueKingSystem();
