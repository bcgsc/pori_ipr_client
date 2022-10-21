import React from 'react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Story } from '@storybook/react/types-6-0';
import DataTable, { DataTableProps } from '.';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
]);

const DEFAULT_PROPS = {
  rowData: [
    {
      column_a: 'data_a',
      column_b: 'data_b',
      column_c: 'data_c_01',
      column_d: 'data_d_01',
    },
    {
      column_a: 'data_a02',
      column_b: 'data_b03',
      column_c: 'data_c_04',
      column_d: 'data_d_05',
    },
    {
      column_a: 'data_a',
      column_b: 'data_b',
      column_c: 'data_c_02',
      column_d: 'data_d_02',
    },
    {
      column_a: 'data_a',
      column_b: 'data_b',
      column_c: 'data_c_03',
      column_d: 'data_d_03',
    },
    {
      column_a: 'data_a01',
      column_b: 'data_b01',
      column_c: 'data_c_05',
      column_d: 'data_d_06',
    },
    {
      column_a: 'data_a01',
      column_b: 'data_b01',
      column_c: 'data_c_06',
      column_d: 'data_d_07',
    },
    {
      column_a: 'data_a02',
      column_b: 'data_b01',
      column_c: 'data_c_07',
      column_d: 'data_d_08',
    },
    {
      column_a: 'data_a03',
      column_b: 'data_b01',
      column_c: 'data_c_09',
      column_d: 'data_d_11',
    },
    {
      column_a: 'data_a03',
      column_b: 'data_b02',
      column_c: 'data_c_09',
      column_d: 'data_d_12',
    },
    {
      column_a: 'data_a03',
      column_b: 'data_b02',
      column_c: 'data_c_09',
      column_d: 'data_d_13',
    },
    {
      column_a: 'data_a02',
      column_b: 'data_b01',
      column_c: 'data_c_07',
      column_d: 'data_d_09',
    },
    {
      column_a: 'data_a03',
      column_b: 'data_b01',
      column_c: 'data_c_08',
      column_d: 'data_d_09',
    },
    {
      column_a: 'data_a03',
      column_b: 'data_b01',
      column_c: 'data_c_09',
      column_d: 'data_d_10',
    },
    {
      column_a: 'data_a03',
      column_b: 'data_b01',
      column_c: 'data_c_09',
      column_d: 'data_d_14',
    },
    {
      column_a: 'data_a03',
      column_b: 'data_b01',
      column_c: 'data_c_09',
      column_d: 'data_d_15',
    },
  ],
  columnDefs: [
    {
      field: 'column_a',
      headerName: 'Col_A',
    },
    {
      field: 'column_b',
      headerName: 'Col_B',
    },
    {
      field: 'column_c',
      headerName: 'Col_C',
    },
    {
      field: 'column_d',
      headerName: 'Col_D',
    },
  ],
};

export default {
  title: 'components/DataTable',
  component: DataTable,
};

const Template = (args) => <DataTable {...args} />;

export const Normal: Story<DataTableProps> = Template.bind({});

Normal.args = {
  ...DEFAULT_PROPS,
};

export const WithTitleText: Story<DataTableProps> = Template.bind({});

WithTitleText.args = {
  ...DEFAULT_PROPS,
  titleText: 'Test title',
};

export const CannotToggleColumns: Story<DataTableProps> = Template.bind({});

CannotToggleColumns.args = {
  ...DEFAULT_PROPS,
  canToggleColumns: false,
};

export const CollapsedRows: Story<DataTableProps> = Template.bind({});
CollapsedRows.args = {
  ...DEFAULT_PROPS,
  collapseColumnFields: ['column_a', 'column_b'],
};

export const CollapsedRowsWithValueGetters: Story<DataTableProps> = Template.bind({});
CollapsedRowsWithValueGetters.args = {
  ...DEFAULT_PROPS,
  columnDefs: [
    {
      field: 'column_a',
      headerName: 'Col_A',
      valueGetter: (params) => params.data.column_a,
    },
    {
      field: 'column_b',
      headerName: 'Col_B',
      valueGetter: (params) => params.data.column_b,
    },
    {
      field: 'column_c',
      headerName: 'Col_C',
    },
    {
      field: 'column_d',
      headerName: 'Col_D',
    },
  ],
  collapseColumnFields: ['column_a', 'column_b'],
};
