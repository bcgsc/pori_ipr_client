import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import api from '@/services/api';
import { ReportType } from '@/common';
import ReportAutocomplete from '..';

jest.mock('@/services/api');
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

const mockReport = {
  ident: 'report-uuid',
  patientId: 'POG123',
} as ReportType;

describe('ReportAutocomplete', () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockReturnValue({
      request: jest.fn().mockResolvedValue({ reports: [] }),
    });
  });

  test('renders the input with the given label', () => {
    render(<ReportAutocomplete label="Linked Report" onSubmit={() => {}} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Linked Report')).toBeInTheDocument();
  });

  test('shows the add button once a report is selected', async () => {
    render(<ReportAutocomplete label="Report" onSubmit={() => {}} defaultValue={mockReport} />);

    expect(await screen.findByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  test('submits the selected report when add is clicked', async () => {
    const onSubmit = jest.fn();
    render(<ReportAutocomplete label="Report" onSubmit={onSubmit} defaultValue={mockReport} />);

    fireEvent.click(await screen.findByRole('button', { name: /add/i }));

    expect(onSubmit).toHaveBeenCalledWith(mockReport);
  });
});
