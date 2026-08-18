import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import KbMatches from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const renderSection = () => {
  // KbMatches destructures [targetedSomaticGenes, allKbMatches] from the call set
  (ApiCallSet as jest.Mock).mockImplementation(() => ({
    request: jest.fn().mockResolvedValue([[], []]),
    abort: jest.fn(),
  }));
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

  test('renders the kb-matches section after loading', async () => {
    renderSection();

    expect(await screen.findByLabelText('Filter Table Text')).toBeInTheDocument();
  });
});
