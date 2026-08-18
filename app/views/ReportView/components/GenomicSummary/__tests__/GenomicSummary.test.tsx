import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useReport from '@/hooks/useReport';
import * as queries from '@/queries/get';
import snackbar from '@/services/SnackbarUtils';
import { makeApiError } from '@/test/apiErrorHelpers';
import GenomicSummary from '..';

jest.mock('@/hooks/useReport');
jest.mock('@/queries/get');
jest.mock('@/services/SnackbarUtils');
// Both children are tested in isolation; mock them so this is a true shell smoke
jest.mock('../../PatientInformation', () => () => <div data-testid="patient-information" />);
jest.mock('../../TumourSummary', () => () => <div data-testid="tumour-summary" />);

const emptyQuery = { data: [], isLoading: false };

const mockQueryHooks = () => {
  (queries.useReportSummaryMicrobial as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportComparators as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportMutationSignatures as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportImmuneCellTypes as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportMutationBurden as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportMsi as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportTmburMutationBurden as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });
  (queries.useReportHlaTypes as jest.Mock).mockReturnValue(emptyQuery);
};

const renderSection = (isPrint = false) => {
  mockQueryHooks();
  (useReport as jest.Mock).mockReturnValue({ report: { ident: 'report-1', state: 'ready' }, canEdit: true });
  return render(
    <MemoryRouter>
      <GenomicSummary isPrint={isPrint} />
    </MemoryRouter>,
  );
};

// Fires the onError the component passed to a given query hook, mimicking a
// failed request without needing a live QueryClient
const failQuery = (hook: keyof typeof queries, err: Error) => {
  (queries[hook] as unknown as jest.Mock).mockImplementation((_ident, options) => {
    options?.onError?.(err);
    return { data: undefined, isLoading: false };
  });
};

describe('GenomicSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the summary shell once data has loaded', async () => {
    renderSection();

    expect(await screen.findByTestId('patient-information')).toBeInTheDocument();
    expect(screen.getByTestId('tumour-summary')).toBeInTheDocument();
  });

  test('still renders when a query 404s', async () => {
    mockQueryHooks();
    failQuery('useReportSummaryMicrobial', makeApiError());
    (useReport as jest.Mock).mockReturnValue({ report: { ident: 'report-1', state: 'ready' }, canEdit: true });

    render(<MemoryRouter><GenomicSummary isPrint={false} /></MemoryRouter>);

    expect(await screen.findByTestId('patient-information')).toBeInTheDocument();
    expect(screen.getByTestId('tumour-summary')).toBeInTheDocument();
  });

  test('names the failed query in the snackbar', async () => {
    mockQueryHooks();
    failQuery('useReportSummaryMicrobial', makeApiError());
    (useReport as jest.Mock).mockReturnValue({ report: { ident: 'report-1', state: 'ready' }, canEdit: true });

    render(<MemoryRouter><GenomicSummary isPrint={false} /></MemoryRouter>);

    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load microbial summary'),
    ));
  });

  test('shows no snackbar in print', async () => {
    mockQueryHooks();
    failQuery('useReportSummaryMicrobial', makeApiError());
    (useReport as jest.Mock).mockReturnValue({ report: { ident: 'report-1', state: 'ready' }, canEdit: true });

    render(<MemoryRouter><GenomicSummary isPrint /></MemoryRouter>);

    await screen.findByTestId('patient-information');
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  // tmbur is absent for older reports by design
  test('stays silent when the TMB query 404s', async () => {
    mockQueryHooks();
    failQuery('useReportTmburMutationBurden', makeApiError());
    (useReport as jest.Mock).mockReturnValue({ report: { ident: 'report-1', state: 'ready' }, canEdit: true });

    render(<MemoryRouter><GenomicSummary isPrint={false} /></MemoryRouter>);

    await screen.findByTestId('patient-information');
    expect(snackbar.error).not.toHaveBeenCalled();
  });
});
