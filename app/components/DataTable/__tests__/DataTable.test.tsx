import React from 'react';
import { screen, render } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api from '@/services/api';
import DataTable from '..';
import { mockRowData, mockColumnDefs } from './mockData';

jest.mock('@/services/api');

describe('DataTable', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([
      ClientSideRowModelModule,
      CsvExportModule,
    ]);
  });

  test('It matches the snapshot', () => {
    const { asFragment } = render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('The row data is shown', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
      />,
    );

    const elems = await Promise.all(mockRowData.map((row) => (
      Promise.all(Object.values(row).map((val) => screen.findByText(val)))
    )));
    for (const elem of elems) {
      for (const val of elem) {
        expect(val).toBeInTheDocument();
      }
    }
  });
});
