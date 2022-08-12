import React from 'react';
import { Story } from '@storybook/react/types-6-0';

import PrintTable, { PrintTableProps } from '.';

const DEFAULT_PROPS = {
  data: [
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
      column_c: 'data_c_04',
      column_d: 'data_d_05',
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
  title: 'components/PrintTable',
  component: PrintTable,
};

const Template = (args) => (
  <PrintTable {...args} />
);

export const Normal: Story<PrintTableProps> = Template.bind({});

Normal.args = {
  ...DEFAULT_PROPS,
};

export const WithColumnsArrangedByProp: Story<PrintTableProps> = Template.bind({});
WithColumnsArrangedByProp.args = {
  ...DEFAULT_PROPS,
  order: ['Col_D', 'Col_A', 'Col_B', 'Col_C'],
};

export const WithCollapseableColumns: Story<PrintTableProps> = Template.bind({});
WithCollapseableColumns.args = {
  ...DEFAULT_PROPS,
  collapseableCols: ['column_a', 'column_b'],
};

export const WithCollapseableColumnsAndOrder: Story<PrintTableProps> = Template.bind({});
WithCollapseableColumnsAndOrder.args = {
  ...DEFAULT_PROPS,
  collapseableCols: ['column_a', 'column_b'],
  order: ['Col_D', 'Col_B', 'Col_C', 'Col_A'],
};
