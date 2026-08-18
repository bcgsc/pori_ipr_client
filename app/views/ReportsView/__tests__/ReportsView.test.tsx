import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import useResource from '@/hooks/useResource';
import { useReportsAll } from '@/queries/get';
import ReportsView from '..';

jest.mock('@/queries/get');
jest.mock('@/hooks/useResource');

const mockReport = {
  ident: 'r1',
  patientId: 'POG1',
  biopsyName: 'bx',
  state: 'ready',
  template: { name: 'genomic' },
  projects: [],
  users: [],
  createdAt: '2024-01-01T00:00:00Z',
};

describe('ReportsView', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  });

  test('renders the reports table once reports are loaded', async () => {
    (useResource as jest.Mock).mockReturnValue({
      adminAccess: true,
      unreviewedAccess: true,
      nonproductionAccess: true,
      allStates: ['ready'],
      unreviewedStates: [],
      nonproductionStates: [],
    });
    (useReportsAll as jest.Mock).mockReturnValue({ isLoading: false, data: { reports: [mockReport] } });

    render(<MemoryRouter><ReportsView /></MemoryRouter>);

    expect(await screen.findByText('Export to TSV')).toBeInTheDocument();
  });
});
