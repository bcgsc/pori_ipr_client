// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef } from '@ag-grid-community/core';

/**
 * Canonical column id / header name for the row-actions column shared across all
 * DataTable grids (views and components). Use this everywhere the actions column is
 * referenced so the id stays consistent (it was previously a mix of 'Actions' and
 * 'actions', which broke the column-visibility logic).
 */
export const ACTIONS_COLUMN = 'Actions';

/**
 * Shared base definition for the pinned row-actions column rendered by ActionCellRenderer.
 * Spread it into a table's columnDefs and override fields as needed, e.g.
 *   { ...actionsColDef }
 *   { ...actionsColDef, cellRenderer: 'KbMatchesActionCellRenderer' }
 *   { ...actionsColDef, field: ACTIONS_COLUMN, minWidth: 132 }
 */
export const actionsColDef: ColDef = {
  headerName: ACTIONS_COLUMN,
  colId: ACTIONS_COLUMN,
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  hide: false,
  sortable: false,
  suppressMenu: true,
};
