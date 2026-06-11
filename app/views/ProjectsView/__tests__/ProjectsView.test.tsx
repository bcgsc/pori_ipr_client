import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api from '@/services/api';
import useResource from '@/hooks/useResource';
import useSecurity from '@/hooks/useSecurity';
import ProjectsView from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
jest.mock('@/hooks/useResource');
jest.mock('@/hooks/useSecurity');

const projects = [
  {
    ident: 'p1', name: 'Project Alpha', description: 'first', reportCount: '5', users: [],
  },
  {
    ident: 'p2', name: 'Project Beta', description: 'second', reportCount: '2', users: [],
  },
];

const renderView = () => {
  (useResource as jest.Mock).mockReturnValue({ adminAccess: true, managerAccess: true });
  (useSecurity as jest.Mock).mockReturnValue({ userDetails: { projects: [] } });
  (api.get as jest.Mock).mockReturnValue({ request: jest.fn().mockResolvedValue(projects) });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectsView />
    </QueryClientProvider>,
  );
};

describe('ProjectsView', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  test('fetches projects and renders the projects table', async () => {
    renderView();

    // The table renders once the projects query resolves (no loading spinner)
    expect(await screen.findByText('Projects')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalled();
  });
});
