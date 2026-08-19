import { APIConnectionFailureError } from '@/services/errors/errors';

/**
 * Builds the error a component actually receives from `api.get(...).request()`
 * when the server responds with a non-2xx code.
 *
 * `errorHandler` maps 404 onto `APIConnectionFailureError` and attaches the
 * status under `content.status`, which is what `useApiError`'s Skip404
 * variants and the react-query `retry` predicate both key off. Constructing a
 * plain `Error` in a test would therefore exercise a different code path.
 *
 * @param status HTTP status code, defaults to 404
 * @param message server supplied message
 */
const makeApiError = (status = 404, message = 'Not Found'): Error => {
  const err = new APIConnectionFailureError({ message, status });
  return err as unknown as Error;
};

/**
 * `ApiCallSet` mock factory. `request(settled)` mirrors the real class:
 * `Promise.all` semantics when called without arguments, `Promise.allSettled`
 * results when called with `true`.
 *
 * @param outcomes one entry per call in the set, in order. An `Error` value
 * marks that call as rejected, anything else as resolved with that value.
 */
const mockApiCallSet = (outcomes: unknown[]) => () => ({
  request: jest.fn(async (settled = false) => {
    if (settled) {
      return outcomes.map((outcome) => (
        outcome instanceof Error
          ? { status: 'rejected' as const, reason: outcome }
          : { status: 'fulfilled' as const, value: outcome }
      ));
    }
    const rejected = outcomes.find((outcome) => outcome instanceof Error);
    if (rejected) {
      throw rejected;
    }
    return outcomes;
  }),
  abort: jest.fn(),
});

/**
 * Marks the call at `index` as a 404 and resolves every other call in the set
 * with the matching entry of `resolved`.
 *
 * @param resolved the happy path values for the whole set
 * @param index which call should 404
 */
const mockApiCallSetWith404At = (resolved: unknown[], index: number) => mockApiCallSet(
  resolved.map((value, i) => (i === index ? makeApiError() : value)),
);

export { makeApiError, mockApiCallSet, mockApiCallSetWith404At };
