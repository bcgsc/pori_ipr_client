import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';

import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import api from '@/services/api';
import { ReportType } from '@/common';
import PatientEdit from '..';

jest.mock('@/services/api');
jest.mock('@/hooks/useConfirmDialog');

const patientInformation = {
  caseType: 'Adult', physician: 'Dr Who', biopsySite: 'Lung', gender: 'F',
};

const report = {
  ident: 'report-1',
  template: { name: 'genomic' },
  alternateIdentifier: 'ALT-1',
  pediatricIds: '',
  biopsyName: 'BX-1',
  dataType: 'DNA',
} as unknown as ReportType;

const renderDialog = (onClose = jest.fn(), isOpen = true) => {
  (useConfirmDialog as jest.Mock).mockReturnValue({ showConfirmDialog: jest.fn() });
  const confirmValue = { isSigned: false } as unknown as React.ContextType<typeof ConfirmContext>;
  render(
    <ConfirmContext.Provider value={confirmValue}>
      <PatientEdit
        patientInformation={patientInformation}
        report={report}
        isOpen={isOpen}
        onClose={onClose}
      />
    </ConfirmContext.Provider>,
  );
  return onClose;
};

describe('PatientEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders patient and report fields when open', () => {
    renderDialog();

    expect(screen.getByText('Edit Patient Information')).toBeInTheDocument();
    expect(screen.getByLabelText('Physician')).toBeInTheDocument();
    expect(screen.getByLabelText('Case Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Alternate ID')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    renderDialog(jest.fn(), false);

    expect(screen.queryByText('Edit Patient Information')).toBeNull();
  });

  test('closes without saving when Close is clicked', () => {
    const onClose = renderDialog();

    fireEvent.click(screen.getByText('Close'));

    expect(onClose).toHaveBeenCalledWith();
    expect(api.put).not.toHaveBeenCalled();
  });

  test('saves edited patient information through the api', async () => {
    const onClose = renderDialog();

    fireEvent.change(screen.getByLabelText('Physician'), {
      target: { value: 'Dr New', name: 'physician' },
    });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.put).toHaveBeenCalledWith(
      '/reports/report-1/patient-information',
      {
        caseType: 'Adult', biopsySite: 'Lung', physician: 'Dr New', gender: 'F',
      },
      {},
    );
  });
});
