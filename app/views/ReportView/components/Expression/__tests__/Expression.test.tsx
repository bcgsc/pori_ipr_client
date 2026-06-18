import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import Expression from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const report = {
  ident: 'report-1',
  patientInformation: { diagnosis: 'Cancer', biopsySite: 'Liver' },
  tumourContent: 70,
  ploidy: 'diploid',
};

const renderSection = () => {
  (api.get as jest.Mock).mockReturnValue({ request: jest.fn().mockResolvedValue([]) });
  const reportValue = { report, canEdit: false } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <Expression />
    </ReportContext.Provider>,
  );
};

describe('Expression', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  test('renders the expression section after data loads', async () => {
    renderSection();

    expect(await screen.findByText('Expression Analysis')).toBeInTheDocument();
  });
});
