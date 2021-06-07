import { formatDate } from '@/utils/date';

const columnDefs = [
  {
    headerName: 'Username',
    field: 'username',
    hide: false,
  },
  {
    headerName: 'Name',
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
    hide: false,
  },
  {
    headerName: 'Groups',
    valueGetter: ({ data }) => data.groups.map(({ name }) => name).join(', '),
    hide: false,
  },
  {
    headerName: 'Projects',
    valueGetter: ({ data }) => data.projects.map(({ name }) => name).join(', '),
    hide: false,
  },
  {
    headerName: 'Authority',
    field: 'type',
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
