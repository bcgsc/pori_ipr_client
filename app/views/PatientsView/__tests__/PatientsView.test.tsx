import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import api from '@/services/api';
import PatientsView from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const mockReport = {
  ident: 'r1',
  patientId: 'POG1',
  biopsyName: 'bx',
  state: 'ready',
  template: { name: 'genomic' },
  projects: [],
  users: [],
  createdAt: '2024-01-01T00:00:00Z',
  patientInformation: {},
};

describe('PatientsView', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  });

  test('fetches and renders reports for the patient id in the url', async () => {
    (api.get as jest.Mock).mockReturnValue({
      request: jest.fn().mockResolvedValue({ reports: [mockReport] }),
    });

    render(
      <MemoryRouter initialEntries={['/reports/patients/POG1']}>
        <Route path="/reports/patients/:patientId"><PatientsView /></Route>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Export to TSV')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/reports?searchText=POG1');
  });
});
