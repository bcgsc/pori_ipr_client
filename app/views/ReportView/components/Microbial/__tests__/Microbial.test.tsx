import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError } from '@/test/apiErrorHelpers';
import Microbial from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const renderSection = (outcome: unknown = []) => {
  (api.get as jest.Mock).mockReturnValue({
    request: outcome instanceof Error
      ? jest.fn().mockRejectedValue(outcome)
      : jest.fn().mockResolvedValue(outcome),
  });
  const reportValue = {
    report: { ident: 'report-1' },
    canEdit: false,
  } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <Microbial print={false} report={{ ident: 'report-1' }} canEdit={false} />
    </ReportContext.Provider>,
  );
};

describe('Microbial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the section once data loads', async () => {
    renderSection();

    expect(await screen.findByText('Microbial Integration')).toBeInTheDocument();
  });

  test('still renders when the images request 404s', async () => {
    renderSection(makeApiError());

    expect(await screen.findByText('Microbial Integration')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection(makeApiError());

    await screen.findByText('Microbial Integration');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalled());
  });
});
