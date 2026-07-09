import { formatDate } from '@/utils/date';
import { ColDef } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  {
    headerName: 'Name',
    field: 'name',
    flex: 1,
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
