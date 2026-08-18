import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import StructuralVariants from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

// [structural-variants, circos images]
const RESOLVED_SET = [[], []];

const renderSection = (setOutcomes: unknown[] = RESOLVED_SET) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the section', async () => {
    renderSection();

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });

  test('renders the variant table when only the circos images 404', async () => {
    renderSection([[], makeApiError()]);

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });

  test('still renders when the variants request 404s', async () => {
    renderSection([makeApiError(), []]);

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });

  test('still renders when both requests 404', async () => {
    renderSection([makeApiError(), makeApiError()]);

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection([[], makeApiError()]);

    await screen.findByText('Structural Variation');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load circos plots'),
    ));
  });
});
