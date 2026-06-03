// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/styles/ag-grid.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/styles/ag-theme-material.css';
import React from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { IFilterParams } from '@ag-grid-community/core';

import CustomSetFilter from '.';

export default {
  title: 'filters/CustomSetFilter',
  component: CustomSetFilter,
};

const SAMPLE_ROWS = [
  { matchedTherapy: 'afatinib' },
  { matchedTherapy: 'cabozantinib' },
  { matchedTherapy: 'erlotinib' },
  { matchedTherapy: 'afatinib' },
  { matchedTherapy: ['osimertinib', 'gefitinib'] },
];

/**
 * Mounted as a real ag-grid column filter. Click the column header menu icon to open the
 * filter and pick values / type to filter the rows below.
 */
export const WithinGrid = ({ data = SAMPLE_ROWS }: { data?: typeof SAMPLE_ROWS }): JSX.Element => (
  <div className="ag-theme-material" style={{ height: 300 }}>
    <AgGridReact
      columnDefs={[
        {
          headerName: 'Matched Therapy',
          field: 'matchedTherapy',
          filter: CustomSetFilter,
          floatingFilter: true,
        },
      ]}
      suppressAnimationFrame
      suppressColumnVirtualisation
      modules={[ClientSideRowModelModule]}
      rowData={data}
      domLayout="autoHeight"
    />
  </div>
);

/**
 * The filter rendered on its own with mocked grid params, so the select-all / per-value
 * checkboxes and the text input are visible without opening a column menu.
 */
const standaloneValues = ['afatinib', 'cabozantinib', 'erlotinib', 'gefitinib', 'osimertinib'];

const standaloneParams = {
  column: {},
  filterChangedCallback: () => {},
  api: {
    forEachNode: (cb: (node: { data: { value: string } }) => void) => standaloneValues.forEach(
      (value) => cb({ data: { value } }),
    ),
    getValue: (_col: unknown, node: { data: { value: string } }) => node.data.value,
  },
} as unknown as IFilterParams;

export const Standalone = (): JSX.Element => (
  <div style={{ width: 260 }}>
    <CustomSetFilter {...standaloneParams} />
  </div>
);
