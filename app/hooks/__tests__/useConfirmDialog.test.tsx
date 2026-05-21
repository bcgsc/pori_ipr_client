import React, { act, useMemo } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import ReportContext from '@/context/ReportContext';
import { ReportContextType } from '@/context/ReportContext/types';
import snackbar from '@/services/SnackbarUtils';
import { ApiCall, ApiCallSet } from '@/services/api';
import { ReportType } from '@/common';
import { queryKeys } from '@/queries/queryKeys';
import reloadWindow from '@/utils/reloadWindow';
import useConfirmDialog from '../useConfirmDialog';

jest.mock('@/services/SnackbarUtils');
jest.mock('@/utils/reloadWindow');

const reloadWindowMock = reloadWindow as jest.MockedFunction<typeof reloadWindow>;

// Capture the AlertDialog onClose handler so tests can drive confirm/cancel
// without going through the real Material-UI dialog (which is rendered via a
// detached createRoot in the hook).
let capturedOnClose: ((removeSignatures?: boolean) => void) | null = null;
jest.mock('@/components/AlertDialog', () => ({
  __esModule: true,
  default: (props: { onClose: (removeSignatures?: boolean) => void }) => {
    capturedOnClose = props.onClose;
    return null;
  },
}));

const REPORT_IDENT = 'report-ident-123';

const buildReport = (templateName = 'genomic'): ReportType => ({
  ident: REPORT_IDENT,
  template: { name: templateName },
} as unknown as ReportType);

const makeApiCall = (requestImpl: jest.Mock): ApiCall => Object.assign(
  Object.create(ApiCall.prototype) as ApiCall,
  { request: requestImpl },
);

const makeApiCallSet = (requestImpl: jest.Mock): ApiCallSet => Object.assign(
  Object.create(ApiCallSet.prototype) as ApiCallSet,
  { request: requestImpl },
);

const wrapperFactory = (templateName = 'genomic') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const reportValue = useMemo<ReportContextType>(() => ({
      canEdit: true,
      report: buildReport(templateName),
      reportTemplateName: templateName,
      refetchReport: (() => null) as unknown as ReportContextType['refetchReport'],
    }), []);
    return (
      <QueryClientProvider client={queryClient}>
        <ReportContext.Provider value={reportValue}>
          {children}
        </ReportContext.Provider>
      </QueryClientProvider>
    );
  };
  return { Wrapper, invalidateSpy };
};

const flushPromises = () => new Promise((resolve) => { setTimeout(resolve, 0); });

describe('useConfirmDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnClose = null;

    // The hook renders into this app-wide container via createRoot.
    const container = document.createElement('div');
    container.id = 'alert-dialog';
    document.body.appendChild(container);
  });

  afterEach(() => {
    const container = document.getElementById('alert-dialog');
    if (container) {
      container.remove();
    }
  });

  describe('fire-and-forget (waitForConfirmation = false)', () => {
    test('runs the calls and reloads the page on confirm', async () => {
      const requestMock = jest.fn().mockResolvedValue({});
      const apiCall = makeApiCall(requestMock);

      const { Wrapper } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      act(() => {
        result.current.showConfirmDialog(apiCall);
      });

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(true);
      });

      expect(requestMock).toHaveBeenCalledTimes(1);
      expect(snackbar.success).toHaveBeenCalledWith('Task completed, refreshing...');
      expect(reloadWindowMock).toHaveBeenCalledTimes(1);
    });

    test('does nothing when the user cancels', async () => {
      const requestMock = jest.fn();
      const apiCall = makeApiCall(requestMock);

      const { Wrapper } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      act(() => {
        result.current.showConfirmDialog(apiCall);
      });

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(false);
      });

      expect(requestMock).not.toHaveBeenCalled();
      expect(snackbar.success).not.toHaveBeenCalled();
      expect(reloadWindowMock).not.toHaveBeenCalled();
    });

    test('surfaces an error snackbar when the api call rejects', async () => {
      const requestMock = jest.fn().mockRejectedValue(new Error('boom'));
      const apiCall = makeApiCall(requestMock);

      const { Wrapper } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      act(() => {
        result.current.showConfirmDialog(apiCall);
      });

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(true);
      });

      expect(snackbar.error).toHaveBeenCalledWith(expect.stringContaining('boom'));
      expect(reloadWindowMock).not.toHaveBeenCalled();
    });

    test('uses a custom confirmText for the success snackbar', async () => {
      const requestMock = jest.fn().mockResolvedValue({});
      const apiCall = makeApiCall(requestMock);

      const { Wrapper } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      act(() => {
        result.current.showConfirmDialog(apiCall, false, 'Custom done!');
      });

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(true);
      });

      expect(snackbar.success).toHaveBeenCalledWith('Custom done!');
    });
  });

  describe('awaitable (waitForConfirmation = true)', () => {
    test('resolves true and invalidates signatures on confirm', async () => {
      const requestMock = jest.fn().mockResolvedValue({});
      const apiCallSet = makeApiCallSet(requestMock);

      const { Wrapper, invalidateSpy } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      let promise!: Promise<boolean>;
      act(() => {
        promise = result.current.showConfirmDialog(apiCallSet, true) as Promise<boolean>;
      });

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(true);
      });

      await expect(promise).resolves.toBe(true);
      expect(requestMock).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledWith(queryKeys.reports.reportSignatures(REPORT_IDENT));
      // Awaitable path must not reload — caller refreshes its own data.
      expect(reloadWindowMock).not.toHaveBeenCalled();
    });

    test('resolves false when the user cancels', async () => {
      const requestMock = jest.fn();
      const apiCall = makeApiCall(requestMock);

      const { Wrapper, invalidateSpy } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      let promise!: Promise<boolean>;
      act(() => {
        promise = result.current.showConfirmDialog(apiCall, true) as Promise<boolean>;
      });

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(false);
      });

      await expect(promise).resolves.toBe(false);
      expect(requestMock).not.toHaveBeenCalled();
      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    test('rejects when the api call fails', async () => {
      const err = new Error('api exploded');
      const requestMock = jest.fn().mockRejectedValue(err);
      const apiCall = makeApiCall(requestMock);

      const { Wrapper, invalidateSpy } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      // Attach a settle-capturing handler eagerly so the eventual rejection
      // isn't an unhandled rejection that bubbles out of `act`.
      let promise!: Promise<boolean>;
      act(() => {
        promise = result.current.showConfirmDialog(apiCall, true) as Promise<boolean>;
      });
      const settled = promise.then(
        (v) => ({ status: 'resolved' as const, value: v }),
        (e) => ({ status: 'rejected' as const, reason: e }),
      );

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(true);
        await flushPromises();
      });

      await expect(settled).resolves.toEqual({ status: 'rejected', reason: err });
      expect(snackbar.error).toHaveBeenCalledWith(expect.stringContaining('api exploded'));
      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    test('accepts an array of calls and awaits all of them', async () => {
      const r1 = jest.fn().mockResolvedValue('a');
      const r2 = jest.fn().mockResolvedValue('b');
      const c1 = makeApiCall(r1);
      const c2 = makeApiCallSet(r2);

      const { Wrapper } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      let promise!: Promise<boolean>;
      act(() => {
        promise = result.current.showConfirmDialog([c1, c2], true) as Promise<boolean>;
      });

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(true);
      });

      await expect(promise).resolves.toBe(true);
      expect(r1).toHaveBeenCalledTimes(1);
      expect(r2).toHaveBeenCalledTimes(1);
    });

    test('passes through raw promises that are not ApiCall instances', async () => {
      const rawResolved = Promise.resolve('done');

      const { Wrapper } = wrapperFactory();
      const { result } = renderHook(() => useConfirmDialog(), { wrapper: Wrapper });

      let promise!: Promise<boolean>;
      act(() => {
        // The hook accepts ApiCall | ApiCallSet | their arrays; raw promises
        // are exercised here against the same parameter slot.
        promise = result.current.showConfirmDialog(
          rawResolved as unknown as ApiCall,
          true,
        ) as Promise<boolean>;
      });

      await waitFor(() => expect(capturedOnClose).not.toBeNull());

      await act(async () => {
        await capturedOnClose!(true);
      });

      await expect(promise).resolves.toBe(true);
    });
  });
});
