import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import MutationBurden from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

// [msi, msi.scatter, mutation-burden images, comparators, mutation-burden]
const RESOLVED_SET = [[], [], [], [], []];

const renderSection = (
  setOutcomes: unknown[] = RESOLVED_SET,
  tmburOutcome: unknown = null,
) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  (api.get as jest.Mock).mockReturnValue({
    request: tmburOutcome instanceof Error
      ? jest.fn().mockRejectedValue(tmburOutcome)
      : jest.fn().mockResolvedValue(tmburOutcome),
  });
  const reportValue = {
    report: { ident: 'report-1' },
    canEdit: false,
  } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <MutationBurden />
    </ReportContext.Provider>,
  );
};

describe('MutationBurden', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the section once data loads', async () => {
    renderSection();

    expect(await screen.findByText('No Mutation Burden data found')).toBeInTheDocument();
  });

  test.each([0, 1, 2, 3, 4])('still renders when call %i 404s', async (index) => {
    renderSection(RESOLVED_SET.map((value, i) => (i === index ? makeApiError() : value)));

    expect(await screen.findByText('No Mutation Burden data found')).toBeInTheDocument();
  });

  test('still renders when every call 404s', async () => {
    renderSection(RESOLVED_SET.map(() => makeApiError()), makeApiError());

    expect(await screen.findByText('No Mutation Burden data found')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection([makeApiError(), [], [], [], []]);

    await screen.findByText('No Mutation Burden data found');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load MSI'),
    ));
  });

  // tmbur was added after many reports were created and no backfill was done,
  // so its absence is expected rather than an error worth surfacing
  test('stays silent when only tmbur-mutation-burden 404s', async () => {
    renderSection(RESOLVED_SET, makeApiError());

    await screen.findByText('No Mutation Burden data found');
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  test('does report a non-404 tmbur failure', async () => {
    renderSection(RESOLVED_SET, makeApiError(500, 'Server Error'));

    await screen.findByText('No Mutation Burden data found');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load TMB mutation burden'),
    ));
  });
});
