import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import ReportContext from '@/context/ReportContext';
import StructuralVariants from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const renderSection = () => {
  // StructuralVariants destructures [svs, images] from the call set
  (ApiCallSet as jest.Mock).mockImplementation(() => ({
    request: jest.fn().mockResolvedValue([[], []]),
    abort: jest.fn(),
  }));
  const reportValue = { report: { ident: 'report-1' }, canEdit: false } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <StructuralVariants />
    </ReportContext.Provider>,
  );
};

describe('StructuralVariants', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  test('renders the section', async () => {
    renderSection();

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });
});
