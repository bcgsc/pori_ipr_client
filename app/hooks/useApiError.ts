import { useCallback, useMemo } from 'react';

import snackbar from '@/services/SnackbarUtils';
import { ErrorMixin } from '@/services/errors/errors';

type ApiError = Error | ErrorMixin;

/**
 * Status code attached by `errorHandler` when the server responded with a
 * non-2xx code. Absent for network/parse failures.
 */
const getStatus = (err: unknown): number | undefined => (
  (err as ErrorMixin)?.content?.status as number | undefined
);

const getMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
};

type UseApiErrorReturnType = {
  /**
   * For imperative `try`/`catch` blocks. Logs always; shows a snackbar only
   * outside of print.
   */
  reportError: (label: string, err: unknown) => void;
  /** As `reportError`, but stays silent for 404s. */
  reportErrorSkip404: (label: string, err: unknown) => void;
  /** `onError` handler for react-query options. */
  queryOnError: (label: string) => (err: ApiError) => void;
  /** As `queryOnError`, but stays silent for 404s. */
  queryOnErrorSkip404: (label: string) => (err: ApiError) => void;
};

/**
 * Consistent API failure reporting for report sections.
 *
 * A section must keep rendering when one of its requests fails, so every
 * consumer of this hook is expected to tolerate missing data rather than bail
 * out. The hook only decides how the failure is surfaced:
 *
 * - the browser view gets a labelled error snackbar so the user knows which
 *   part of the page is incomplete
 * - the print view gets a console error only, since a snackbar would be
 *   captured in the printed output and there is nobody to dismiss it
 *
 * 404 is treated as "this resource does not exist for this report", which is a
 * normal state for many optional sections, hence the `Skip404` variants.
 *
 * @param isPrint true when rendering inside PrintView
 */
const useApiError = (isPrint = false): UseApiErrorReturnType => {
  const reportError = useCallback((label: string, err: unknown) => {
    console.error(label, err);
    if (!isPrint) {
      snackbar.error(`${label}: ${getMessage(err)}`);
    }
  }, [isPrint]);

  const reportErrorSkip404 = useCallback((label: string, err: unknown) => {
    if (getStatus(err) === 404) {
      // Still logged so the absence is traceable, but not worth interrupting
      // the user over: the resource simply does not exist for this report
      console.error(label, err);
      return;
    }
    reportError(label, err);
  }, [reportError]);

  const queryOnError = useCallback((label: string) => (
    (err: ApiError) => reportError(label, err)
  ), [reportError]);

  const queryOnErrorSkip404 = useCallback((label: string) => (
    (err: ApiError) => reportErrorSkip404(label, err)
  ), [reportErrorSkip404]);

  return useMemo(() => ({
    reportError,
    reportErrorSkip404,
    queryOnError,
    queryOnErrorSkip404,
  }), [reportError, reportErrorSkip404, queryOnError, queryOnErrorSkip404]);
};

export type { UseApiErrorReturnType };
export { getStatus };
export default useApiError;
