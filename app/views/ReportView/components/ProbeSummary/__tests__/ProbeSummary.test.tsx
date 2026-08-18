import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import ProbeSummary from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
jest.mock('../../PatientInformation', () => () => <div data-testid="patient-information" />);

const report = {
  ident: 'report-1',
  state: 'ready',
  template: { ident: 'template-1', name: 'probe' },
};

// [probe-test-information, signatures, probe-results, small-mutations, signature-types]
const RESOLVED_SET = [null, null, [], [], []];

type RenderOptions = { isPrint?: boolean; setOutcomes?: unknown[]; loadedDispatch?: jest.Mock };

const renderSection = ({
  isPrint = false,
  setOutcomes = RESOLVED_SET,
  loadedDispatch = jest.fn(),
}: RenderOptions = {}) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  const reportValue = { report, canEdit: false } as unknown as React.ContextType<typeof ReportContext>;
  const confirmValue = { setIsSigned: jest.fn() } as unknown as React.ContextType<typeof ConfirmContext>;
  render(
    <ReportContext.Provider value={reportValue}>
      <ConfirmContext.Provider value={confirmValue}>
        <ProbeSummary isPrint={isPrint} loadedDispatch={loadedDispatch} />
      </ConfirmContext.Provider>
    </ReportContext.Provider>,
  );
  return { loadedDispatch };
};

describe('ProbeSummary', () => {
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

  test('renders the summary once data loads', async () => {
    renderSection();

    expect(await screen.findByText('Genomic Events with Potential Therapeutic Association')).toBeInTheDocument();
  });

  test.each([0, 1, 2, 3, 4])('still renders when call %i 404s', async (index) => {
    renderSection({ setOutcomes: RESOLVED_SET.map((value, i) => (i === index ? makeApiError() : value)) });

    expect(await screen.findByText('Genomic Events with Potential Therapeutic Association')).toBeInTheDocument();
  });

  test('still renders when every call 404s', async () => {
    renderSection({ setOutcomes: RESOLVED_SET.map(() => makeApiError()) });

    expect(await screen.findByText('Genomic Events with Potential Therapeutic Association')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection({ setOutcomes: [null, null, makeApiError(), [], []] });

    await screen.findByText('Genomic Events with Potential Therapeutic Association');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load probe results'),
    ));
  });

  test('shows no snackbar in print even when every call 404s', async () => {
    renderSection({ isPrint: true, setOutcomes: RESOLVED_SET.map(() => makeApiError()) });

    await screen.findByText('Genomic Events with Potential Therapeutic Association');
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  test('signals loaded in print even when every call 404s', async () => {
    const { loadedDispatch } = renderSection({
      isPrint: true,
      setOutcomes: RESOLVED_SET.map(() => makeApiError()),
    });

    await waitFor(() => expect(loadedDispatch).toHaveBeenCalledWith({ type: 'summary-probe' }));
  });
});
