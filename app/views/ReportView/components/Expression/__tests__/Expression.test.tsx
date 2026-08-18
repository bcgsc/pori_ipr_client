import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import Expression from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const report = {
  ident: 'report-1',
  patientInformation: { diagnosis: 'Cancer', biopsySite: 'Liver' },
  tumourContent: 70,
  ploidy: 'diploid',
};

// [expression-variants, expression-density-graphs]
const renderSection = (
  setOutcomes: unknown[] = [[], []],
  comparatorsOutcome: unknown = [],
) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  (api.get as jest.Mock).mockReturnValue({
    request: comparatorsOutcome instanceof Error
      ? jest.fn().mockRejectedValue(comparatorsOutcome)
      : jest.fn().mockResolvedValue(comparatorsOutcome),
  });
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the expression section after data loads', async () => {
    renderSection();

    expect(await screen.findByText('Expression Analysis')).toBeInTheDocument();
  });

  test('still renders when the expression variants request 404s', async () => {
    renderSection([makeApiError(), []]);

    // The section leaves loading state instead of spinning forever
    expect(await screen.findByText('Expression Analysis')).toBeInTheDocument();
    expect(screen.getByText('Tissue Sites')).toBeInTheDocument();
  });

  test('still renders when the density graph request 404s', async () => {
    renderSection([[], makeApiError()]);

    expect(await screen.findByText('Expression Analysis')).toBeInTheDocument();
  });

  test('still renders when every request 404s', async () => {
    renderSection([makeApiError(), makeApiError()], makeApiError());

    expect(await screen.findByText('Expression Analysis')).toBeInTheDocument();
  });

  test('shows a labelled snackbar naming the failed request', async () => {
    renderSection([makeApiError(), []]);

    await screen.findByText('Expression Analysis');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load expression variants'),
    ));
  });

  test('reports the comparators failure separately', async () => {
    renderSection([[], []], makeApiError());

    await screen.findByText('Expression Analysis');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load comparators'),
    ));
  });
});
