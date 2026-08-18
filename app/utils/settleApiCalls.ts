/**
 * Helpers for working with `ApiCallSet.request(true)`, which resolves to
 * `Promise.allSettled` results so that one failing call (e.g. a 404 for a
 * resource that simply does not exist on this report) does not discard the
 * responses of every other call in the set.
 */

type SettleErrorHandler = (label: string, err: unknown) => void;

/**
 * Maps settled results back onto a positional tuple, substituting `undefined`
 * for any call that rejected and reporting it through `onError`.
 *
 * @param results settled results, in the same order the calls were pushed
 * @param labels human readable name per call, used in the error message
 * @param onError invoked once per rejected call
 */
const unwrapSettled = <T extends unknown[]>(
  results: PromiseSettledResult<unknown>[],
  labels: string[],
  onError: SettleErrorHandler,
): Partial<T> => results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    onError(labels[index] ?? `request ${index + 1}`, result.reason);
    return undefined;
  }) as Partial<T>;

export type { SettleErrorHandler };
export { unwrapSettled };
export default unwrapSettled;
