import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import MutationSignatures from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

// [images, mutation-signatures]
const RESOLVED_SET = [[], []];

const renderSection = (setOutcomes: unknown[] = RESOLVED_SET) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const reportValue = {
    report: { ident: 'report-1' },
    canEdit: false,
  } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportContext.Provider value={reportValue}>
        <MutationSignatures />
      </ReportContext.Provider>
    </QueryClientProvider>,
  );
};

describe('MutationSignatures', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the signature sections once data loads', async () => {
    renderSection();

    expect(await screen.findByText('Single base substitution signatures')).toBeInTheDocument();
  });

  test('renders the signature tables when only the plots 404', async () => {
    renderSection([makeApiError(), []]);

    expect(await screen.findByText('Single base substitution signatures')).toBeInTheDocument();
    expect(screen.getByText('Double base substitution signatures')).toBeInTheDocument();
  });

  test('still renders when the signatures request 404s', async () => {
    renderSection([[], makeApiError()]);

    expect(await screen.findByText('Single base substitution signatures')).toBeInTheDocument();
  });

  test('still renders when both requests 404', async () => {
    renderSection([makeApiError(), makeApiError()]);

    expect(await screen.findByText('Single base substitution signatures')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection([makeApiError(), []]);

    await screen.findByText('Single base substitution signatures');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load mutation signature plots'),
    ));
  });
});
