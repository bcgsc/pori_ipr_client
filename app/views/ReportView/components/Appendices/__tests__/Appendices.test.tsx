import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import useReport from '@/hooks/useReport';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import Appendices from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
jest.mock('@/hooks/useReport');

const report = {
  ident: 'report-1',
  template: { ident: 'template-1', name: 'genomic' },
  projects: [{ ident: 'project-1', reportProject: { additionalProject: false } }],
  sampleInfo: [],
};

// [appendices, appendices/tcga, comparators]
const RESOLVED_SET = [{ seqQC: [] }, [], []];

type RenderOptions = {
  isPrint?: boolean;
  setOutcomes?: unknown[];
  appendixCOutcome?: unknown;
  loadedDispatch?: jest.Mock;
};

const renderSection = ({
  isPrint = false,
  setOutcomes = RESOLVED_SET,
  appendixCOutcome = { text: 'Appendix C body' },
  loadedDispatch = jest.fn(),
}: RenderOptions = {}) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  (api.get as jest.Mock).mockReturnValue({
    request: appendixCOutcome instanceof Error
      ? jest.fn().mockRejectedValue(appendixCOutcome)
      : jest.fn().mockResolvedValue(appendixCOutcome),
  });
  (useReport as jest.Mock).mockReturnValue({ report, canEdit: false });
  render(<Appendices isPrint={isPrint} loadedDispatch={loadedDispatch} />);
  return { loadedDispatch };
};

describe('Appendices', () => {
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

  test('renders the appendices once data loads', async () => {
    renderSection();

    expect(await screen.findByText('Appendix A')).toBeInTheDocument();
    expect(screen.getByText('Appendix B')).toBeInTheDocument();
  });

  test.each([0, 1, 2])('still renders when call %i 404s', async (index) => {
    renderSection({ setOutcomes: RESOLVED_SET.map((value, i) => (i === index ? makeApiError() : value)) });

    expect(await screen.findByText('Appendix A')).toBeInTheDocument();
    expect(screen.getByText('Appendix B')).toBeInTheDocument();
  });

  test('still renders when every call 404s', async () => {
    renderSection({
      setOutcomes: RESOLVED_SET.map(() => makeApiError()),
      appendixCOutcome: makeApiError(),
    });

    expect(await screen.findByText('Appendix A')).toBeInTheDocument();
  });

  test('names the failed request in the snackbar', async () => {
    renderSection({ setOutcomes: [makeApiError(), [], []] });

    await screen.findByText('Appendix A');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load appendices'),
    ));
  });

  // A missing project specific appendix C is expected; the component falls
  // back to the template default rather than reporting it
  test('falls back to the default appendix C on a 404', async () => {
    (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(RESOLVED_SET));
    const request = jest.fn()
      .mockRejectedValueOnce(makeApiError())
      .mockResolvedValueOnce({ text: 'Default appendix C body' });
    (api.get as jest.Mock).mockReturnValue({ request });
    (useReport as jest.Mock).mockReturnValue({ report, canEdit: false });

    render(<Appendices isPrint={false} loadedDispatch={jest.fn()} />);

    await screen.findByText('Appendix A');
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  test('shows no snackbar in print even when every call 404s', async () => {
    renderSection({
      isPrint: true,
      setOutcomes: RESOLVED_SET.map(() => makeApiError()),
      appendixCOutcome: makeApiError(500, 'Server Error'),
    });

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  test('signals loaded in print even when every call 404s', async () => {
    const { loadedDispatch } = renderSection({
      isPrint: true,
      setOutcomes: RESOLVED_SET.map(() => makeApiError()),
      appendixCOutcome: makeApiError(),
    });

    await waitFor(() => expect(loadedDispatch).toHaveBeenCalledWith({ type: 'appendices' }));
  });
});
