import { renderHook } from '@testing-library/react';

import snackbar from '@/services/SnackbarUtils';
import { makeApiError } from '@/test/apiErrorHelpers';
import useApiError, { getStatus } from '../useApiError';

jest.mock('@/services/SnackbarUtils');

describe('useApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('getStatus', () => {
    test('reads the status attached by errorHandler', () => {
      expect(getStatus(makeApiError(404))).toBe(404);
      expect(getStatus(makeApiError(500, 'Server Error'))).toBe(500);
    });

    test('is undefined for errors without a response', () => {
      expect(getStatus(new Error('network down'))).toBeUndefined();
      expect(getStatus(undefined)).toBeUndefined();
    });
  });

  describe('in the browser view', () => {
    test('reportError shows a labelled snackbar', () => {
      const { result } = renderHook(() => useApiError(false));

      result.current.reportError('Failed to load comparators', makeApiError(404));

      expect(snackbar.error).toHaveBeenCalledTimes(1);
      expect(snackbar.error).toHaveBeenCalledWith('Failed to load comparators: Not Found');
    });

    test('reportErrorSkip404 logs but shows no snackbar on 404', () => {
      const { result } = renderHook(() => useApiError(false));

      result.current.reportErrorSkip404('Failed to load TMB', makeApiError(404));

      expect(snackbar.error).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    test('reportErrorSkip404 still reports other statuses', () => {
      const { result } = renderHook(() => useApiError(false));

      result.current.reportErrorSkip404('Failed to load TMB', makeApiError(500, 'Server Error'));

      expect(snackbar.error).toHaveBeenCalledWith('Failed to load TMB: Server Error');
    });

    test('queryOnError returns a handler usable as a react-query onError', () => {
      const { result } = renderHook(() => useApiError(false));

      result.current.queryOnError('Failed to load MSI')(makeApiError(404));

      expect(snackbar.error).toHaveBeenCalledWith('Failed to load MSI: Not Found');
    });
  });

  describe('in the print view', () => {
    test('reportError logs but shows no snackbar', () => {
      const { result } = renderHook(() => useApiError(true));

      result.current.reportError('Failed to load comparators', makeApiError(404));

      expect(snackbar.error).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    test('queryOnError shows no snackbar', () => {
      const { result } = renderHook(() => useApiError(true));

      result.current.queryOnError('Failed to load MSI')(makeApiError(500, 'Server Error'));

      expect(snackbar.error).not.toHaveBeenCalled();
    });
  });

  test('handlers are stable across re-renders with the same isPrint', () => {
    const { result, rerender } = renderHook(({ isPrint }) => useApiError(isPrint), {
      initialProps: { isPrint: false },
    });
    const first = result.current;

    rerender({ isPrint: false });

    expect(result.current.reportError).toBe(first.reportError);
    expect(result.current.queryOnError).toBe(first.queryOnError);
  });
});
