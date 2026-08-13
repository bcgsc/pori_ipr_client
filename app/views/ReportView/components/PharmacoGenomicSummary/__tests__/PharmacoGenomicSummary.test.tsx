import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import { makeApiError, mockApiCallSet, mockApiCallSetWith404At } from '@/test/apiErrorHelpers';
import PharmacoGenomicSummary from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
// Covered by its own suite; mocked so this stays a shell smoke test
jest.mock('../../PatientInformation', () => () => <div data-testid="patient-information" />);

const report = {
  ident: 'report-1',
  state: 'ready',
  template: { ident: 'template-1', name: 'pharmacogenomic' },
};

// [signatures, pharmacogenomic kb-matches, cancer predisposition kb-matches, signature types]
const RESOLVED_SET = [null, [], [], []];

type RenderOptions = {
  isPrint?: boolean;
  setOutcomes?: unknown[];
  testInfoOutcome?: unknown;
  loadedDispatch?: jest.Mock;
};

const renderSection = ({
  isPrint = false,
  setOutcomes = RESOLVED_SET,
  testInfoOutcome = null,
  loadedDispatch = jest.fn(),
}: RenderOptions = {}) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  (api.get as jest.Mock).mockReturnValue({
    request: testInfoOutcome instanceof Error
      ? jest.fn().mockRejectedValue(testInfoOutcome)
      : jest.fn().mockResolvedValue(testInfoOutcome),
  });
  const reportValue = { report, canEdit: false } as unknown as React.ContextType<typeof ReportContext>;
  const confirmValue = { setIsSigned: jest.fn() } as unknown as React.ContextType<typeof ConfirmContext>;
  render(
    <ReportContext.Provider value={reportValue}>
      <ConfirmContext.Provider value={confirmValue}>
        <PharmacoGenomicSummary isPrint={isPrint} loadedDispatch={loadedDispatch} />
      </ConfirmContext.Provider>
    </ReportContext.Provider>,
  );
  return { loadedDispatch };
};

describe('PharmacoGenomicSummary', () => {
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

    expect(await screen.findByText('Pharmacogenomic Variants')).toBeInTheDocument();
    expect(screen.getByText('Cancer Predisposition Variants')).toBeInTheDocument();
  });

  test.each([
    [0, 'signatures'],
    [1, 'pharmacogenomic kb-matches'],
    [2, 'cancer predisposition kb-matches'],
    [3, 'signature types'],
  ])('still renders when call %i (%s) 404s', async (index) => {
    (ApiCallSet as unknown as jest.Mock).mockImplementation(
      mockApiCallSetWith404At(RESOLVED_SET, index as number),
    );
    (api.get as jest.Mock).mockReturnValue({ request: jest.fn().mockResolvedValue(null) });
    const reportValue = { report, canEdit: false } as unknown as React.ContextType<typeof ReportContext>;
    const confirmValue = { setIsSigned: jest.fn() } as unknown as React.ContextType<typeof ConfirmContext>;
    render(
      <ReportContext.Provider value={reportValue}>
        <ConfirmContext.Provider value={confirmValue}>
          <PharmacoGenomicSummary isPrint={false} loadedDispatch={jest.fn()} />
        </ConfirmContext.Provider>
      </ReportContext.Provider>,
    );

    expect(await screen.findByText('Pharmacogenomic Variants')).toBeInTheDocument();
    expect(screen.getByText('Cancer Predisposition Variants')).toBeInTheDocument();
  });

  test('keeps the sections that resolved when one call 404s', async () => {
    // signatures 404s but both kb-match calls resolve with no rows
    renderSection({ setOutcomes: [makeApiError(), [], [], []] });

    expect(await screen.findByText('No pharmacogenomic variants found')).toBeInTheDocument();
    expect(screen.getByText('No cancer predisposition variants found')).toBeInTheDocument();
  });

  test('shows a labelled snackbar naming the failed request', async () => {
    renderSection({ setOutcomes: [makeApiError(), [], [], []] });

    await screen.findByText('Pharmacogenomic Variants');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load signatures'),
    ));
  });

  test('reports a probe test information failure separately', async () => {
    renderSection({ testInfoOutcome: makeApiError() });

    await screen.findByText('Pharmacogenomic Variants');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load probe test information'),
    ));
  });

  test('shows no snackbar in print even when every call 404s', async () => {
    renderSection({
      isPrint: true,
      setOutcomes: [makeApiError(), makeApiError(), makeApiError(), makeApiError()],
      testInfoOutcome: makeApiError(),
    });

    await screen.findByText('Pharmacogenomic Variants');
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  // Regression: loadedDispatch used to sit inside the try block, so a failed
  // request left PrintView waiting on this section forever
  test('signals loaded in print even when every call 404s', async () => {
    const { loadedDispatch } = renderSection({
      isPrint: true,
      setOutcomes: [makeApiError(), makeApiError(), makeApiError(), makeApiError()],
      testInfoOutcome: makeApiError(),
    });

    await waitFor(() => expect(loadedDispatch).toHaveBeenCalledWith({ type: 'summary-pcp' }));
  });

  test('signals loaded on the happy path', async () => {
    const { loadedDispatch } = renderSection({ isPrint: true });

    await waitFor(() => expect(loadedDispatch).toHaveBeenCalledWith({ type: 'summary-pcp' }));
  });
});
