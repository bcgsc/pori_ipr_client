import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import CopyNumber from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const report = { ident: 'report-1' } as unknown as React.ContextType<typeof ReportContext>['report'];

// [copy-variants, cnvLoh.circos, chr images, legacy cnv/loh images]
const RESOLVED_SET = [[], [undefined], [], []];

const renderSection = (setOutcomes: unknown[] = RESOLVED_SET) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the section once data loading resolves', async () => {
    renderSection();

    expect(screen.getByText('Copy Number Analyses')).toBeInTheDocument();
    expect(await screen.findByText('Summary of Copy Number Events')).toBeInTheDocument();
  });

  test.each([0, 1, 2, 3])('still renders when call %i 404s', async (index) => {
    renderSection(RESOLVED_SET.map((value, i) => (i === index ? makeApiError() : value)));

    expect(await screen.findByText('Summary of Copy Number Events')).toBeInTheDocument();
  });

  // Regression: the circos image used to be destructured directly off the
  // coupled call set, so a missing image took the CNV table down with it
  test('renders the CNV table when only the circos image 404s', async () => {
    renderSection([[], makeApiError(), [], []]);

    expect(await screen.findByText('Summary of Copy Number Events')).toBeInTheDocument();
  });

  test('still renders when every call 404s', async () => {
    renderSection(RESOLVED_SET.map(() => makeApiError()));

    expect(await screen.findByText('Summary of Copy Number Events')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection([makeApiError(), [undefined], [], []]);

    await screen.findByText('Summary of Copy Number Events');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load copy variants'),
    ));
  });
});
