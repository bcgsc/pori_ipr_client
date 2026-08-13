import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError } from '@/test/apiErrorHelpers';
import TherapeuticTargets from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const renderSection = (outcome: unknown = [], isPrint = false) => {
  (api.get as jest.Mock).mockReturnValue({
    request: outcome instanceof Error
      ? jest.fn().mockRejectedValue(outcome)
      : jest.fn().mockResolvedValue(outcome),
  });
  const reportValue = { report: { ident: 'report-1' }, canEdit: false } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <TherapeuticTargets isPrint={isPrint} />
    </ReportContext.Provider>,
  );
};

describe('TherapeuticTargets', () => {
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

  test('renders the therapeutic and resistance tables', async () => {
    renderSection();

    expect(await screen.findByText('Potential Therapeutic Targets')).toBeInTheDocument();
    expect(screen.getByText('Potential Resistance and Toxicity')).toBeInTheDocument();
  });

  test('still renders both tables when the request 404s', async () => {
    renderSection(makeApiError());

    expect(await screen.findByText('Potential Therapeutic Targets')).toBeInTheDocument();
    expect(screen.getByText('Potential Resistance and Toxicity')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection(makeApiError());

    await screen.findByText('Potential Therapeutic Targets');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load therapeutic targets'),
    ));
  });

  test('shows no snackbar in print', async () => {
    renderSection(makeApiError(), true);

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(snackbar.error).not.toHaveBeenCalled();
  });
});
