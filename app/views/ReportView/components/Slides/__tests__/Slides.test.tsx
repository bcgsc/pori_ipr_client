import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import { makeApiError } from '@/test/apiErrorHelpers';
import Slides from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
jest.mock('@/hooks/useReport');

type RenderOptions = { isPrint?: boolean; outcome?: unknown; loadedDispatch?: jest.Mock };

const renderSection = ({
  isPrint = false,
  outcome = [],
  loadedDispatch = jest.fn(),
}: RenderOptions = {}) => {
  (api.get as jest.Mock).mockReturnValue({
    request: outcome instanceof Error
      ? jest.fn().mockRejectedValue(outcome)
      : jest.fn().mockResolvedValue(outcome),
  });
  (useReport as jest.Mock).mockReturnValue({ report: { ident: 'report-1' }, canEdit: false });
  const reportValue = {
    report: { ident: 'report-1' },
    canEdit: false,
  } as unknown as React.ContextType<typeof ReportContext>;
  render(
    <ReportContext.Provider value={reportValue}>
      <Slides isPrint={isPrint} loadedDispatch={loadedDispatch} />
    </ReportContext.Provider>,
  );
  return { loadedDispatch };
};

describe('Slides', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the section once data loads', async () => {
    renderSection();

    expect(await screen.findByText('Additional Information')).toBeInTheDocument();
  });

  test('still renders when the slides request 404s', async () => {
    renderSection({ outcome: makeApiError() });

    expect(await screen.findByText('Additional Information')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection({ outcome: makeApiError() });

    await screen.findByText('Additional Information');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load slides'),
    ));
  });

  test('shows no snackbar in print', async () => {
    renderSection({ isPrint: true, outcome: makeApiError() });

    await screen.findByText('Additional Information');
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  test('signals loaded in print even when the request 404s', async () => {
    const { loadedDispatch } = renderSection({ isPrint: true, outcome: makeApiError() });

    await waitFor(() => expect(loadedDispatch).toHaveBeenCalledWith({ type: 'slides' }));
  });
});
