import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import useReport from '@/hooks/useReport';
import { useTemplatesAll } from '@/queries/get';
import Settings from '..';

jest.mock('@/hooks/useReport');
jest.mock('@/queries/get');
jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
// Child cards/dialogs carry their own data dependencies; isolate the Settings shell
jest.mock('../components/ReportHistory', () => () => null);
jest.mock('../components/AssociationCard', () => () => null);
jest.mock('../components/AddUserCard', () => () => null);
jest.mock('../components/AddUserDialog', () => () => null);
jest.mock('../components/DeleteReportDialog', () => () => null);

const mockReport = {
  ident: 'report-1',
  state: 'ready',
  reportVersion: '1.0',
  kbVersion: 'kb-1',
  users: [],
  template: { ident: 'tmpl-1', name: 'genomic' },
  createdBy: {
    ident: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com',
  },
  createdAt: '2024-01-01T00:00:00Z',
};

const renderSettings = () => {
  (useReport as jest.Mock).mockReturnValue({ report: mockReport, canEdit: true });
  (useTemplatesAll as jest.Mock).mockReturnValue({ data: [mockReport.template], isSuccess: true });
  const queryClient = new QueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Settings />
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe('Settings', () => {
  test('renders the settings sections', async () => {
    renderSettings();

    expect(await screen.findByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Assigned Users')).toBeInTheDocument();
  });

  test('exposes the delete and update actions', () => {
    renderSettings();

    expect(screen.getByText('Delete Report')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });
});
