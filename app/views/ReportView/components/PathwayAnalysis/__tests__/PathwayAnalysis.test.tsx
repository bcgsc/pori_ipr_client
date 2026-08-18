import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import * as queries from '@/queries/get';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError } from '@/test/apiErrorHelpers';
import PathwayAnalysis from '..';

jest.mock('@/queries/get');
jest.mock('@/services/SnackbarUtils');
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn(), setQueryData: jest.fn() }),
}));
// Both children own their upload/confirm behaviour and are out of scope here
jest.mock('../components/Pathway', () => () => <div data-testid="pathway" />);
jest.mock('../components/Legend', () => () => <div data-testid="legend" />);

type QueryResult = {
  data?: unknown;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
};

const ok: QueryResult = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
};

type RenderOptions = {
  isPrint?: boolean;
  pathway?: QueryResult;
  legend?: QueryResult;
  loadedDispatch?: jest.Mock;
};

const renderSection = ({
  isPrint = false,
  pathway = ok,
  legend = ok,
  loadedDispatch = jest.fn(),
}: RenderOptions = {}) => {
  (queries.useReportSummaryPathwayAnalysis as jest.Mock).mockReturnValue(pathway);
  (queries.useLegend as jest.Mock).mockReturnValue(legend);
  const reportValue = {
    report: { ident: 'report-1', template: { name: 'genomic' } },
    canEdit: false,
  } as unknown as React.ContextType<typeof ReportContext>;
  render(
    <ReportContext.Provider value={reportValue}>
      <PathwayAnalysis isPrint={isPrint} loadedDispatch={loadedDispatch} />
    </ReportContext.Provider>,
  );
  return { loadedDispatch };
};

const failed = (): QueryResult => ({
  data: undefined, isLoading: false, isError: true, error: makeApiError(),
});

describe('PathwayAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the section once data loads', async () => {
    renderSection();

    expect(await screen.findByText('Pathway Analysis')).toBeInTheDocument();
  });

  test('still renders when the pathway request 404s', async () => {
    renderSection({ pathway: failed() });

    expect(await screen.findByText('Pathway Analysis')).toBeInTheDocument();
  });

  test('still renders when the legend request 404s', async () => {
    renderSection({ legend: failed() });

    expect(await screen.findByText('Pathway Analysis')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection({ pathway: failed() });

    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load pathway analysis'),
    ));
  });

  // In print the notification is captured in the printed output with nobody
  // to dismiss it, so the failure is logged instead
  test('shows no snackbar in print', async () => {
    renderSection({ isPrint: true, pathway: failed() });

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  test('signals loaded even when the request 404s', async () => {
    const { loadedDispatch } = renderSection({ isPrint: true, pathway: failed() });

    await waitFor(() => expect(loadedDispatch).toHaveBeenCalledWith({ type: 'pathway-analysis' }));
  });
});
