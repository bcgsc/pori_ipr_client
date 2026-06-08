import React from 'react';
import {
  screen, render, waitFor, fireEvent, within,
} from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ModuleRegistry, GridApi } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ACTIONS_COLUMN, actionsColDef } from '@/utils/actionsColumnDef';
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

  test('Clicking a column header sorts that column', async () => {
    const { container } = render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
      />,
    );

    await screen.findByText('pattredes');

    const usernameHeader = container.querySelector('[col-id="username"]');
    expect(usernameHeader).toHaveAttribute('aria-sort', 'none');

    fireEvent.click(screen.getByText('Username'));

    await waitFor(() => expect(usernameHeader).toHaveAttribute('aria-sort', 'ascending'));
  });

  test('Unchecking a column in the picker hides it', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        canToggleColumns
      />,
    );

    await screen.findByText('pattredes');
    expect(screen.getByText('Username')).toBeInTheDocument();

    // Open the column picker
    fireEvent.click(screen.getByTestId('MoreHorizIcon').closest('button'));
    fireEvent.click(await screen.findByText('Toggle Columns'));
    const dialog = await screen.findByRole('dialog');

    // Uncheck the Username column, then close the picker
    fireEvent.click(within(dialog).getByLabelText('Username'));
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    await waitFor(() => expect(screen.queryByText('Username')).toBeNull());
  });

  test('An empty grid shows the no-rows overlay when editable', async () => {
    render(
      <DataTable
        rowData={[]}
        columnDefs={mockColumnDefs}
        canEdit
      />,
    );

    expect(await screen.findByText('No Rows To Show')).toBeInTheDocument();
  });

  test('Empty rowData with no edit access shows the no-data message instead of a grid', () => {
    render(
      <DataTable
        rowData={[]}
        columnDefs={mockColumnDefs}
      />,
    );

    expect(screen.getByText('No data to display')).toBeInTheDocument();
    expect(screen.queryByTestId('grid')).toBeNull();
  });

  test('Export to TSV triggers a tab-separated export', async () => {
    const exportSpy = jest.spyOn(GridApi.prototype, 'exportDataAsCsv').mockImplementation(() => {});

    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={mockColumnDefs}
        canExport
      />,
    );

    await screen.findByText('pattredes');

    fireEvent.click(screen.getByTestId('MoreHorizIcon').closest('button'));
    fireEvent.click(await screen.findByText('Export to TSV'));

    expect(exportSpy).toHaveBeenCalledTimes(1);
    expect(exportSpy).toHaveBeenCalledWith(expect.objectContaining({ columnSeparator: '\t' }));

    exportSpy.mockRestore();
  });

  test('Clicking the view-details action opens the detail dialog', async () => {
    render(
      <DataTable
        rowData={mockRowData}
        columnDefs={[...mockColumnDefs, { ...actionsColDef }]}
      />,
    );

    const detailIcons = await screen.findAllByTestId('view-details');
    fireEvent.click(detailIcons[0]);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
