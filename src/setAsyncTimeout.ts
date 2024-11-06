import { Temporal } from "temporal-polyfill";

type AsyncTimeoutResult = Temporal.Duration | { cancel: true } | undefined | null;

/**
 * setAsyncInterval repeatedly runs an asynchronous function, similar to
 * `setInterval`.
 *
 * Key things to note:
 *   * The function will never be run multiple times simultaneously. The next
 *     execution is only scheduled after the function `f` ran to completion.
 *   * You can vary the delay between successive intervals by returning
 *     durations from `f`. This will then override the default delay.
 *   * Returning `{ cancel: true }` will immediately cancel any future calls
 *     to `f`.
 *   * Unlike `setInterval`, the first call to `f` happens immediately instead
 *     of after an initial delay.
 * @param f an asynchronous function that will run repeatedly
 * @param delay the delay between successive invocations of `f`
 * @returns a function that cancels future invocations of `f`
 */
export function setAsyncInterval(f: () => (Promise<void> | Promise<AsyncTimeoutResult>), delay: Temporal.Duration) {
	let cancelled = false as boolean;
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	const cancel = () => {
		cancelled = true;
		clearTimeout(timeoutId);
	};
	const delayMilliseconds = delay.total({
		unit: 'milliseconds',
		relativeTo: Temporal.Now.zonedDateTimeISO(),
	});

	void (async () => {
		while (!cancelled) {
			try {
				const result = await f();
				let nextDelay = delayMilliseconds;
				if (result && 'cancel' in result && result.cancel as boolean) {
					break;
				} else if (result && result instanceof Temporal.Duration) {
					nextDelay = result.total({
						unit: 'milliseconds',
						relativeTo: Temporal.Now.zonedDateTimeISO(),
					});
				}
				await new Promise<void>(resolve => {
					timeoutId = setTimeout(() => {
						timeoutId = undefined;
						resolve();
					}, nextDelay);
				});
			} catch (e: unknown) {
				console.error('unhandled exception in setAsyncTimeout', e)
			}
		}
	})();
	return cancel;
}
