import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { ReportType } from '@/common';
import { TumourSummaryEdit } from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
jest.mock('@/hooks/useConfirmDialog');

const report = {
  ident: 'report-1',
  template: { name: 'genomic' },
  tumourContent: 70,
  subtyping: 'subtype',
} as unknown as ReportType;

const renderDialog = (onEditClose = jest.fn(), isOpen = true) => {
  (useConfirmDialog as jest.Mock).mockReturnValue({ showConfirmDialog: jest.fn() });
  const queryClient = new QueryClient();
  const confirmValue = { isSigned: false } as unknown as React.ContextType<typeof ConfirmContext>;
  render(
    <QueryClientProvider client={queryClient}>
      <ConfirmContext.Provider value={confirmValue}>
        <TumourSummaryEdit
          microbial={[]}
          report={report}
          tCellCd8={undefined}
          mutationBurden={undefined}
          tmburMutBur={undefined}
          msi={undefined}
          hla={[]}
          isOpen={isOpen}
          onEditClose={onEditClose}
        />
      </ConfirmContext.Provider>
    </QueryClientProvider>,
  );
  return onEditClose;
};

describe('TumourSummaryEdit', () => {
  test('renders the dialog with report fields and actions when open', () => {
    renderDialog();

    expect(screen.getByText('Edit Tumour Summary')).toBeInTheDocument();
    expect(screen.getByLabelText('Tumour Content (%)')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    renderDialog(jest.fn(), false);

    expect(screen.queryByText('Edit Tumour Summary')).toBeNull();
  });

  test('closes without saving when Close is clicked', () => {
    const onEditClose = renderDialog();

    fireEvent.click(screen.getByText('Close'));

    expect(onEditClose).toHaveBeenCalledWith(false);
  });
});
