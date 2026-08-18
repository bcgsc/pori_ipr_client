import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import ReportsTable from '..';

const mockRows = [
  {
    patientID: 'POG1', reportType: 'genomic', state: 'ready', reportIdent: 'r1', date: '2024-01-01',
  },
  {
    patientID: 'POG2', reportType: 'genomic', state: 'ready', reportIdent: 'r2', date: '2024-01-02',
  },
] as never;

describe('ReportsTable', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  test('renders the rows and the export action', async () => {
    render(<MemoryRouter><ReportsTable rowData={mockRows} /></MemoryRouter>);

    expect(await screen.findByText('POG1')).toBeInTheDocument();
    expect(screen.getByText('Export to TSV')).toBeInTheDocument();
  });

  test('double-clicking a row navigates to that report summary', async () => {
    const history = createMemoryHistory();
    const pushSpy = jest.spyOn(history, 'push');

    render(<Router history={history}><ReportsTable rowData={mockRows} /></Router>);

    const cell = await screen.findByText('POG1');
    // Retry until the grid api is wired up and the row handler fires
    await waitFor(() => {
      fireEvent.doubleClick(cell);
      expect(pushSpy).toHaveBeenCalledWith('/report/r1/summary');
    });
  });
});
