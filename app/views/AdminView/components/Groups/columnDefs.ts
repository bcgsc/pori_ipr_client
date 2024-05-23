import { formatDate } from '@/utils/date';

const columnDefs = [
  {
    headerName: 'Group Name',
    field: 'name',
    hide: false,
  },
  {
    headerName: 'Description',
    field: 'description',
    hide: false,
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    hide: false,
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
