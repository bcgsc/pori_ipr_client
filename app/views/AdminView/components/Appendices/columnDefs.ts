import { formatDate } from '@/utils/date';
import { ColDef } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  {
    headerName: 'Name',
    field: 'name',
    hide: false,
  },
  {
    headerName: 'Org',
    field: 'organization',
    hide: false,
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    hide: false,
  },
  {
    headerName: 'Appendix Text',
    valueGetter: ({ data }) => data.appendix?.text,
    cellRenderer: 'AppendixCellRenderer',
    flex: 1,
    autoHeight: true,
    wrapText: true,
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
