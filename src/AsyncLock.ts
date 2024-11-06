/**
 * ## Example Usage
 *
 * ```typescript
 * const lock = new AsyncLock();
 *
 * async function myAsyncFunction(data) {
 *     const leave = await lock.enter();
 *     try {
 *         // do async operations here
 *     } finally {
 *         leave();
 *     }
 * }
 * ```
 */
export class AsyncLock {
	#lastPromise: Promise<void> = Promise.resolve();

	async enter() {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let _resolve = () => {};
		const lastPromise = this.#lastPromise;
		this.#lastPromise = new Promise<void>(resolve => {
			_resolve = resolve;
		});
		await lastPromise;
		return _resolve;
	}
}
