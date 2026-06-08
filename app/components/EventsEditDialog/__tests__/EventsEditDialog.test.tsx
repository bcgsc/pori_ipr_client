import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';

import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import api from '@/services/api';
import EventsEditDialog from '..';

jest.mock('@/services/api');
jest.mock('@/hooks/useConfirmDialog');
// GeneAutocomplete fetches gene options; stub it to isolate the dialog
jest.mock('../../GeneAutocomplete', () => () => <div data-testid="gene-autocomplete" />);

const mockEditData = {
  ident: 'evt-1',
  variant: 'old variant',
  comments: 'old comments',
  gene: { ident: 'gene-1', name: 'TP53' },
};

const renderDialog = (onClose = jest.fn(), isOpen = true) => {
  (useConfirmDialog as jest.Mock).mockReturnValue({ showConfirmDialog: jest.fn() });
  const reportValue = { report: { ident: 'report-1' } } as unknown as React.ContextType<typeof ReportContext>;
  const confirmValue = { isSigned: false } as unknown as React.ContextType<typeof ConfirmContext>;
  render(
    <ReportContext.Provider value={reportValue}>
      <ConfirmContext.Provider value={confirmValue}>
        <EventsEditDialog editData={mockEditData} isOpen={isOpen} onClose={onClose} />
      </ConfirmContext.Provider>
    </ReportContext.Provider>,
  );
  return onClose;
};

describe('EventsEditDialog', () => {
  test('renders the edit fields when open', () => {
    renderDialog();

    expect(screen.getByText('Edit Event')).toBeInTheDocument();
    expect(screen.getByLabelText('Variant')).toBeInTheDocument();
    expect(screen.getByLabelText('comments')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    renderDialog(jest.fn(), false);

    expect(screen.queryByText('Edit Event')).toBeNull();
  });

  test('closes without saving when Close is clicked', () => {
    const onClose = renderDialog();

    fireEvent.click(screen.getByText('Close'));

    expect(onClose).toHaveBeenCalledWith();
    expect(api.put).not.toHaveBeenCalled();
  });

  test('saves edited fields via the api and returns the result', async () => {
    (api.put as jest.Mock).mockReturnValue({
      request: jest.fn().mockResolvedValue({ saved: true }),
    });
    const onClose = renderDialog();

    fireEvent.change(screen.getByLabelText('Variant'), {
      target: { value: 'new variant', name: 'variant' },
    });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => expect(onClose).toHaveBeenCalledWith({ saved: true }));
    expect(api.put).toHaveBeenCalledWith(
      '/reports/report-1/probe-results/evt-1',
      { comments: 'old comments', variant: 'new variant', gene: 'gene-1' },
    );
  });
});
