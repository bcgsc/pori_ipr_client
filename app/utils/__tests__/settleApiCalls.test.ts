import { makeApiError } from '@/test/apiErrorHelpers';
import { unwrapSettled } from '../settleApiCalls';

describe('unwrapSettled', () => {
  const settle = (outcomes: unknown[]): PromiseSettledResult<unknown>[] => outcomes.map(
    (outcome) => (outcome instanceof Error
      ? { status: 'rejected' as const, reason: outcome }
      : { status: 'fulfilled' as const, value: outcome }),
  );

  test('returns every value positionally when all calls resolve', () => {
    const onError = jest.fn();

    const result = unwrapSettled(settle([['a'], ['b'], ['c']]), ['a', 'b', 'c'], onError);

    expect(result).toEqual([['a'], ['b'], ['c']]);
    expect(onError).not.toHaveBeenCalled();
  });

  test('keeps the resolved values when one call 404s', () => {
    const onError = jest.fn();
    const err = makeApiError(404);

    const result = unwrapSettled(
      settle([['variants'], err, ['images']]),
      ['load variants', 'load circos', 'load images'],
      onError,
    );

    expect(result).toEqual([['variants'], undefined, ['images']]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith('load circos', err);
  });

  test('reports each failure separately', () => {
    const onError = jest.fn();

    unwrapSettled(
      settle([makeApiError(404), ['ok'], makeApiError(500, 'Server Error')]),
      ['first', 'second', 'third'],
      onError,
    );

    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError.mock.calls.map(([label]) => label)).toEqual(['first', 'third']);
  });

  test('falls back to a positional label when labels are missing', () => {
    const onError = jest.fn();

    unwrapSettled(settle([makeApiError(404)]), [], onError);

    expect(onError).toHaveBeenCalledWith('request 1', expect.any(Error));
  });
});
