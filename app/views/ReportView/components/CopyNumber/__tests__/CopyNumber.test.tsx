import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import ReportContext from '@/context/ReportContext';
import CopyNumber from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const report = { ident: 'report-1' } as unknown as React.ContextType<typeof ReportContext>['report'];

const renderSection = () => {
  // CopyNumber destructures [cnvs, [circos], newImages, oldImages] from the call set
  (ApiCallSet as jest.Mock).mockImplementation(() => ({
    request: jest.fn().mockResolvedValue([[], [undefined], [], []]),
    abort: jest.fn(),
  }));
  const reportValue = { report, canEdit: false } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <CopyNumber />
    </ReportContext.Provider>,
  );
};

describe('CopyNumber', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  test('renders the section once data loading resolves', async () => {
    renderSection();

    expect(screen.getByText('Copy Number Analyses')).toBeInTheDocument();
    expect(await screen.findByText('Summary of Copy Number Events')).toBeInTheDocument();
  });
});
