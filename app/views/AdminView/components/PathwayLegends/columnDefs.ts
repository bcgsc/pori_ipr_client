import { formatDate } from '@/utils/date';
import { ColDef } from '@ag-grid-community/core';
import LegendPreviewCellRenderer from './components/LegendPreviewCellRenderer';

const columnDefs: ColDef[] = [
  {
    headerName: 'Name',
    field: 'name',
    flex: 1,
  },
  {
    headerName: 'Preview',
    // Deliberately no `field`: the renderer reads the row via params.data, and binding
    // this column to `data` would dump the base64 blob into CSV exports.
    colId: 'preview',
    cellRenderer: LegendPreviewCellRenderer,
    // Let the row grow to the image's natural height rather than clipping it.
    autoHeight: true,
    // Keep DataTable's autoSizeColumns from measuring the image and blowing the width out.
    suppressAutoSize: true,
    sortable: false,
    suppressMenu: true,
    minWidth: 240,
    flex: 2,
  },
  {
    headerName: 'Format',
    field: 'format',
    maxWidth: 110,
  },
  {
    headerName: 'Default',
    valueGetter: ({ data }) => (data.default ? 'Yes' : 'No'),
    maxWidth: 110,
  },
  {
    headerName: 'Filename',
    field: 'filename',
    flex: 1,
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    minWidth: 90,
  },
  {
    headerName: 'Updated',
    valueGetter: ({ data }) => formatDate(data.updatedAt),
    minWidth: 90,
  },
  {
    headerName: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    sortable: false,
    suppressMenu: true,
  },
];

export default columnDefs;
