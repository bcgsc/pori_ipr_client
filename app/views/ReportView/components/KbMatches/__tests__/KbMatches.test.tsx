import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import KbMatches from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

// [probe-results, kb-matched-statements]
const RESOLVED_SET = [[], []];

const renderSection = (setOutcomes: unknown[] = RESOLVED_SET) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  const reportValue = {
    report: { ident: 'report-1', template: { name: 'genomic' } },
    canEdit: false,
  } as unknown as React.ContextType<typeof ReportContext>;
  const confirmValue = { isSigned: false } as unknown as React.ContextType<typeof ConfirmContext>;
  const queryClient = new QueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ReportContext.Provider value={reportValue}>
          <ConfirmContext.Provider value={confirmValue}>
            <KbMatches />
          </ConfirmContext.Provider>
        </ReportContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe('KbMatches', () => {
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

  test('renders the kb-matches section after loading', async () => {
    renderSection();

    expect(await screen.findByLabelText('Filter Table Text')).toBeInTheDocument();
  });

  // probe-results only feeds the targeted somatic genes table; the kb-matches
  // tables must survive its absence
  test('still renders when the probe results request 404s', async () => {
    renderSection([makeApiError(), []]);

    expect(await screen.findByLabelText('Filter Table Text')).toBeInTheDocument();
  });

  test('still renders when the kb-matches request 404s', async () => {
    renderSection([[], makeApiError()]);

    expect(await screen.findByLabelText('Filter Table Text')).toBeInTheDocument();
  });

  test('still renders when both requests 404', async () => {
    renderSection([makeApiError(), makeApiError()]);

    expect(await screen.findByLabelText('Filter Table Text')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection([makeApiError(), []]);

    await screen.findByLabelText('Filter Table Text');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load probe results'),
    ));
  });
});
