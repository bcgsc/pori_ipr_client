import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import { makeApiError } from '@/test/apiErrorHelpers';
import Slides from '..';
import SlideType from '../types';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
jest.mock('@/hooks/useReport');

type RenderOptions = { isPrint?: boolean; outcome?: unknown; loadedDispatch?: jest.Mock };

const mockSlide = {
  ident: 'slide-1',
  name: 'Mock Slide',
  object: 'aW1hZ2U=',
  object_type: 'image/png',
} as unknown as SlideType;

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
  const { container } = render(
    <ReportContext.Provider value={reportValue}>
      <Slides isPrint={isPrint} loadedDispatch={loadedDispatch} />
    </ReportContext.Provider>,
  );
  return { container, loadedDispatch };
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

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  test('signals loaded in print even when the request 404s', async () => {
    const { loadedDispatch } = renderSection({ isPrint: true, outcome: makeApiError() });

    await waitFor(() => expect(loadedDispatch).toHaveBeenCalledWith({ type: 'slides' }));
  });

  test('keeps the empty section in the report view', async () => {
    renderSection();

    expect(await screen.findByText('No slides available')).toBeInTheDocument();
  });

  test('omits the empty section in print', async () => {
    const { container, loadedDispatch } = renderSection({ isPrint: true });

    await waitFor(() => expect(loadedDispatch).toHaveBeenCalledWith({ type: 'slides' }));
    expect(screen.queryByText('Additional Information')).not.toBeInTheDocument();
    expect(screen.queryByText('No slides available')).not.toBeInTheDocument();
    // An orphaned break would open a blank page in the printed report
    expect(container.querySelector('.page-break')).not.toBeInTheDocument();
  });

  test('renders the section and its page break in print when the report has slides', async () => {
    const { container } = renderSection({ isPrint: true, outcome: [mockSlide] });

    expect(await screen.findByText('Additional Information')).toBeInTheDocument();
    expect(screen.getByAltText(mockSlide.name)).toBeInTheDocument();
    expect(container.querySelector('.page-break')).toBeInTheDocument();
  });

  test('adds no page break outside of print', async () => {
    const { container } = renderSection({ outcome: [mockSlide] });

    expect(await screen.findByAltText(mockSlide.name)).toBeInTheDocument();
    expect(container.querySelector('.page-break')).not.toBeInTheDocument();
  });
});
