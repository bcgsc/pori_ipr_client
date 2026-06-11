import React from 'react';
import { render, screen } from '@testing-library/react';

import useReport from '@/hooks/useReport';
import { ReportType } from '@/common';
import PatientInformation from '..';

jest.mock('@/hooks/useReport');
jest.mock('@/services/SnackbarUtils');
// PatientEdit pulls in confirm-dialog/api deps; isolate this component
jest.mock('@/components/PatientEdit', () => () => null);

const mockReport = {
  ident: 'report-1',
  alternateIdentifier: 'ALT-9',
  pediatricIds: 'PED-1',
  createdAt: '2024-01-15T00:00:00Z',
  sampleInfo: [{ sample: 'Tumour', collectionDate: '2024-01-01' }],
  patientInformation: {
    caseType: 'Adult', physician: 'Dr Strange', biopsySite: 'Liver', gender: 'M',
  },
  biopsyName: 'BX-7',
  dataType: 'DNA',
} as unknown as ReportType;

const renderPatientInfo = (props = {}) => {
  (useReport as jest.Mock).mockReturnValue({ report: mockReport, refetchReport: jest.fn() });
  return render(
    <PatientInformation
      loadedDispatch={jest.fn()}
      canEdit={false}
      isPrint={false}
      {...props}
    />,
  );
};

describe('PatientInformation', () => {
  test('renders patient fields from the report', async () => {
    renderPatientInfo();

    expect(await screen.findByText('Dr Strange')).toBeInTheDocument();
    expect(screen.getByText('ALT-9')).toBeInTheDocument();
    expect(screen.getByText('Adult')).toBeInTheDocument();
    expect(screen.getByText('Physician')).toBeInTheDocument();
  });

  test('shows the edit button when editable and not printing', async () => {
    renderPatientInfo({ canEdit: true });

    expect(await screen.findByTestId('EditIcon')).toBeInTheDocument();
  });

  test('hides the edit button when not editable', async () => {
    renderPatientInfo({ canEdit: false });

    await screen.findByText('Dr Strange');
    expect(screen.queryByTestId('EditIcon')).toBeNull();
  });

  test('renders the print table layout when printing', async () => {
    renderPatientInfo({ isPrint: true });

    expect(await screen.findByText('Dr Strange')).toBeInTheDocument();
    expect(screen.queryByTestId('EditIcon')).toBeNull();
  });
});
