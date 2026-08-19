import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import Immune from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

// [immune-cell-types, images, hla-types]
const RESOLVED_SET = [[], [], []];

const renderSection = (setOutcomes: unknown[] = RESOLVED_SET) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  const reportValue = {
    report: { ident: 'report-1' },
    canEdit: false,
  } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <Immune />
    </ReportContext.Provider>,
  );
};

describe('Immune', () => {
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

  test('renders both tables once data loads', async () => {
    renderSection();

    expect(await screen.findByText('Immune Cell Types')).toBeInTheDocument();
    expect(screen.getByText('HLA Types')).toBeInTheDocument();
  });

  test.each([0, 1, 2])('still renders when call %i 404s', async (index) => {
    renderSection(RESOLVED_SET.map((value, i) => (i === index ? makeApiError() : value)));

    expect(await screen.findByText('Immune Cell Types')).toBeInTheDocument();
    expect(screen.getByText('HLA Types')).toBeInTheDocument();
  });

  test('still renders when every call 404s', async () => {
    renderSection([makeApiError(), makeApiError(), makeApiError()]);

    expect(await screen.findByText('Immune Cell Types')).toBeInTheDocument();
  });

  test('reports each failed call separately', async () => {
    renderSection([makeApiError(), [], makeApiError()]);

    await screen.findByText('Immune Cell Types');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledTimes(2));
    expect(snackbar.error).toHaveBeenCalledWith(expect.stringContaining('Failed to load immune cell types'));
    expect(snackbar.error).toHaveBeenCalledWith(expect.stringContaining('Failed to load HLA types'));
  });
});
