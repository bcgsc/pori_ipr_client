import React from 'react';
import {
  screen, render, waitFor, fireEvent,
} from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import DataTable from '..';
import {
  mockRowData,
  mockColumnDefs,
  mockTitleText,
  mockFilterText,
  mockVisibleColumns,
  mockDemoDescription,
} from './mockData';
import { ACTIONS_COLUMN } from '@/utils/actionsColumnDef';

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
      />,
    );

    expect(await screen.findByText(mockTitleText)).toBeInTheDocument();
  });

  test('filterText filters table content', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        filterText={mockFilterText}
      />,
    );

    // Row that should be shown
    const elems = await Promise.all(
      Object.values(mockRowData[1]).map((val) => screen.findByText(val)),
    );
    for (const elem of elems) {
      expect(elem).not.toBeNull();
    }

    // Row that should not be shown
    await waitFor(() => {
      for (const val of Object.values(mockRowData[0])) {
        expect(screen.queryByText(val)).toBeNull();
      }
    });
  });

  test('visibleColumns affects the shown columns', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        visibleColumns={mockVisibleColumns}
        syncVisibleColumns={() => {}}
      />,
    );

    await waitFor(() => expect(screen.queryByText(mockColumnDefs[0].headerName)).toBeNull());
    expect(await screen.findByText(mockColumnDefs[1].headerName)).toBeInTheDocument();
    expect(await screen.findByText(mockColumnDefs[2].headerName)).toBeInTheDocument();
  });

  test('Empty visibleColumns is treated as no filter and shows all columns', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        visibleColumns={[]}
        syncVisibleColumns={() => {}}
      />,
    );

    expect(await screen.findByText(mockColumnDefs[0].headerName)).toBeInTheDocument();
    expect(await screen.findByText(mockColumnDefs[1].headerName)).toBeInTheDocument();
    expect(await screen.findByText(mockColumnDefs[2].headerName)).toBeInTheDocument();
  });

  test('Toggling columns does not accumulate duplicate Actions entries', async () => {
    const syncVisibleColumns = jest.fn();
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        visibleColumns={['username', 'Actions']}
        syncVisibleColumns={syncVisibleColumns}
        canToggleColumns
      />,
    );

    // Wait for the grid to be ready before driving the column picker
    await screen.findByText('pattredes');

    // One open-the-menu / open-the-picker / close-the-picker cycle
    const openAndCloseColumnPicker = async () => {
      fireEvent.click(screen.getByTestId('MoreHorizIcon').closest('button'));
      fireEvent.click(await screen.findByText('Toggle Columns'));
      const dialog = await screen.findByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    };

    // Repeating the cycle must not keep re-adding 'Actions' to the synced columns
    await openAndCloseColumnPicker();
    await openAndCloseColumnPicker();
    await openAndCloseColumnPicker();

    expect(syncVisibleColumns).toHaveBeenCalled();
    const [lastSynced] = syncVisibleColumns.mock.calls.at(-1);
    expect(lastSynced.filter((col: string) => col === ACTIONS_COLUMN)).toHaveLength(1);
  });

  test('Does not throw when visibleColumns is undefined', () => {
    expect(() => {
      render(
        <DataTable
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          visibleColumns={undefined}
        />,
      );
    }).not.toThrow();
  });

  test('The demoDescription is shown', async () => {
    // DemoDescription only renders when the demo env flag is set
    const prevIsDemo = window._env_?.IS_DEMO;
    window._env_ = { ...window._env_, IS_DEMO: true };

    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        demoDescription={mockDemoDescription}
      />,
    );
    expect(await screen.findByText(mockDemoDescription)).toBeInTheDocument();

    window._env_.IS_DEMO = prevIsDemo;
  });
});
