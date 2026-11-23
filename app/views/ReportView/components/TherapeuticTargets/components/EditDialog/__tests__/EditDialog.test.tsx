import React from 'react';
import {
  fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ReportType } from '@/common';
import ConfirmContext from '@/context/ConfirmContext';
import ReportContext from '@/context/ReportContext';
import api, { ApiCall } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import reloadWindow from '@/utils/reloadWindow';
import EditDialog from '..';

jest.mock('@/services/SnackbarUtils');
jest.mock('@/utils/reloadWindow');
// GraphKB lookups are unrelated to signature removal. Keep the real edit
// dialog and confirmation hook so these tests exercise their integration.
jest.mock('../../AutocompleteHandler', () => ({ AutocompleteHandler: () => null }));

const mockReport = {
  ident: 'report-1',
  template: { name: 'genomic' },
} as unknown as ReportType;

const newTarget = {
  gene: 'TP53',
  variant: 'mutation',
  therapy: 'Drug-A',
  context: 'sensitivity',
};

let queryClient: QueryClient;
let requestMock: jest.Mock;
let onClose: jest.Mock;

const renderNewTarget = (isSigned = true, tableType = 'therapeutic') => render(
  <QueryClientProvider client={queryClient}>
    <ReportContext.Provider
      value={{
        canEdit: true,
        report: mockReport,
        reportTemplateName: 'genomic',
        refetchReport: () => null,
      }}
    >
      <ConfirmContext.Provider value={{ isSigned, setIsSigned: jest.fn() }}>
        <EditDialog
          isOpen
          editData={tableType === 'chemoresistance' ? { ...newTarget, context: 'resistance' } : newTarget}
          tableType={tableType}
          onClose={onClose}
        />
      </ConfirmContext.Provider>
    </ReportContext.Provider>
  </QueryClientProvider>,
);

const saveNewTarget = () => {
  // The target has all required fields; changing notes marks the form dirty.
  fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'New target' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
};

const confirmationDialog = async () => {
  const title = await screen.findByText('Confirm Action');
  return within(title.closest('[role="dialog"]') as HTMLElement);
};

beforeEach(() => {
  jest.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  onClose = jest.fn();
  requestMock = jest.fn().mockResolvedValue({ ident: 'new-target', ...newTarget });
  // Preserve instanceof ApiCall, which the real confirmation hook requires.
  const postCall = Object.assign(Object.create(ApiCall.prototype) as ApiCall, {
    request: requestMock,
  });
  jest.spyOn(api, 'post').mockReturnValue(postCall);

  const container = document.createElement('div');
  container.id = 'alert-dialog';
  document.body.appendChild(container);
});

afterEach(() => {
  jest.restoreAllMocks();
  queryClient.clear();
  document.getElementById('alert-dialog')?.remove();
});

describe('Adding therapeutic targets to signed reports', () => {
  test.each(['therapeutic', 'chemoresistance'])(
    'Requires signature-removal confirmation before adding a %s record',
    async (tableType) => {
      renderNewTarget(true, tableType);
      saveNewTarget();

      const dialog = await confirmationDialog();
      expect(dialog.getByText(
        'Making this change will cause the reviewer and analyst signatures to be removed. Do you want to proceed?',
      )).toBeInTheDocument();
      expect(api.post).toHaveBeenCalledWith(
        '/reports/report-1/therapeutic-targets',
        expect.objectContaining({ type: tableType, gene: 'TP53', notes: 'New target' }),
        {},
      );
      expect(requestMock).not.toHaveBeenCalled();
      expect(reloadWindow).not.toHaveBeenCalled();

      fireEvent.click(dialog.getByRole('button', { name: 'Yes' }));

      await waitFor(() => expect(reloadWindow).toHaveBeenCalledTimes(1));
      expect(requestMock).toHaveBeenCalledTimes(1);
      expect(snackbar.success).toHaveBeenCalledWith('Task completed, refreshing...');
      // Signed creation refreshes the report (including signatures) via reload,
      // rather than updating only the target in the parent component.
      expect(onClose).not.toHaveBeenCalled();
    },
  );

  test('Cancelling preserves signatures by not creating the target or reloading', async () => {
    renderNewTarget();
    saveNewTarget();

    const dialog = await confirmationDialog();
    fireEvent.click(dialog.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument());
    expect(requestMock).not.toHaveBeenCalled();
    expect(reloadWindow).not.toHaveBeenCalled();
    expect(snackbar.success).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('Unsigned reports create the target without signature-removal confirmation', async () => {
    renderNewTarget(false);
    saveNewTarget();

    await waitFor(() => expect(onClose).toHaveBeenCalledWith({ ident: 'new-target', ...newTarget }));
    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    expect(reloadWindow).not.toHaveBeenCalled();
  });
});
