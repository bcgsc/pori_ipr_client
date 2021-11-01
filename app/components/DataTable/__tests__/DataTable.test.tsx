import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api from '@/services/api';
import DataTable from '..';
import {
  mockRowData,
  mockColumnDefs,
  mockTitleText,
  mockFilterText,
  mockVisibleColumns,
  mockDemoDescription,
} from './mockData';

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

  test('The title is shown', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        titleText={mockTitleText}
      />
    );

    expect(await screen.findByText(mockTitleText)).toBeInTheDocument();
  });

  test('filterText filters table content', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        filterText={mockFilterText}
      />
    );

    // Row that should be shown
    let elems = await Promise.all(
      Object.values(mockRowData[1]).map((val) => screen.findByText(val))
    );
    for (const elem of elems) {
      expect(elem).not.toBeNull();
    }

    // Row that should not be shown
    elems = await Promise.all(
      Object.values(mockRowData[0]).map((val) => screen.queryByText(val))
    );
    for (const elem of elems) {
      expect(elem).toBeNull();
    }
  });

  test('visibleColumns affects the shown columns', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        visibleColumns={mockVisibleColumns}
      />
    );

    waitFor(() => expect(screen.queryByText(mockColumnDefs[0].headerName)).toBeNull());
    expect(await screen.findByText(mockColumnDefs[1].headerName)).toBeInTheDocument();
    expect(await screen.findByText(mockColumnDefs[2].headerName)).toBeInTheDocument();
  });

  test('Empty visibleColumns shows no columns', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        visibleColumns={[]}
      />
    );

    waitFor(() => {
      expect(screen.queryByText(mockColumnDefs[0].headerName)).toBeNull();
      expect(screen.queryByText(mockColumnDefs[1].headerName)).toBeNull();
      expect(screen.queryByText(mockColumnDefs[2].headerName)).toBeNull();
    });
  });

  test('The demoDescription is shown', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        demoDescription={mockDemoDescription}
      />
    );
    waitFor(() => expect(screen.getByText(mockDemoDescription)).toBeInTheDocument());
  });
});
