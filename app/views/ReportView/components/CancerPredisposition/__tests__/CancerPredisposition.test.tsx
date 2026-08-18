import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import CancerPredisposition from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const renderSection = () => {
  (api.get as jest.Mock).mockReturnValue({ request: jest.fn().mockResolvedValue([]) });
  const reportValue = { report: { ident: 'report-1' }, canEdit: false } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <CancerPredisposition />
    </ReportContext.Provider>,
  );
};

describe('CancerPredisposition', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  test('renders the cancer predisposition variants table', async () => {
    renderSection();

    expect(
      await screen.findByText('Known Cancer Predisposition Variants from Targeted Gene Report'),
    ).toBeInTheDocument();
  });
});
