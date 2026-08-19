import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';

import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import VariantEditDialog from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
jest.mock('@/hooks/useConfirmDialog');

const mockEditData = {
  ident: 'variant-1',
  gene: { name: 'TP53' },
  proteinChange: 'p.R175H',
} as never;

const renderDialog = (onClose = jest.fn(), existingVariants: string[] = []) => {
  (useConfirmDialog as jest.Mock).mockReturnValue({ showConfirmDialog: jest.fn() });
  (api.get as jest.Mock).mockReturnValue({
    request: jest.fn().mockResolvedValue(existingVariants.map((geneVariant) => ({ geneVariant }))),
  });
  const reportValue = { report: { ident: 'report-1' } } as unknown as React.ContextType<typeof ReportContext>;
  const confirmValue = { isSigned: false } as unknown as React.ContextType<typeof ConfirmContext>;
  render(
    <ReportContext.Provider value={reportValue}>
      <ConfirmContext.Provider value={confirmValue}>
        <VariantEditDialog editData={mockEditData} variantType="mut" isOpen onClose={onClose} />
      </ConfirmContext.Provider>
    </ReportContext.Provider>,
  );
  return onClose;
};

describe('VariantEditDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the computed variant string', async () => {
    renderDialog();

    expect(await screen.findByText(/TP53:p.R175H/)).toBeInTheDocument();
    expect(screen.getByText('Key Alterations Edit')).toBeInTheDocument();
  });

  test('adds a new variant to the summary on submit', async () => {
    (api.post as jest.Mock).mockReturnValue({
      request: jest.fn().mockResolvedValue({}),
    });
    const onClose = renderDialog(jest.fn(), ['OTHER:variant']);

    await screen.findByText(/TP53:p.R175H/);
    // Retry until the available-variants fetch has resolved behind the submit handler
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add to Summary'));
      expect(api.post).toHaveBeenCalledWith(
        '/reports/report-1/summary/genomic-alterations-identified',
        { geneVariant: 'TP53:p.R175H', variantType: 'mut', variantIdent: 'variant-1' },
      );
    });

    await waitFor(() => expect(onClose).toHaveBeenCalledWith(mockEditData));
    expect(snackbar.success).toHaveBeenCalled();
  });

  test('warns and closes when the variant is already in the summary', async () => {
    const onClose = renderDialog(jest.fn(), ['TP53:p.R175H']);

    // wait for the existing variants to load before submitting
    await screen.findByText(/TP53:p.R175H/);
    fireEvent.click(screen.getByText('Add to Summary'));

    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith('Variant already in key alterations.'));
    expect(api.post).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith();
  });
});
