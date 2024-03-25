import { formatDate } from '@/utils/date';

const readOnlyColDefs = [
  {
    headerName: 'Name',
    field: 'name',
    hide: false,
  },
  {
    field: 'description',
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    hide: false,
  },
  {
    headerName: 'Number of reports',
    valueGetter: ({ data }) => Number(data?.reportCount),
  },
  {
    headerName: 'Number of users',
    valueGetter: ({ data }) => data?.users?.length,
  },
];

const adminColDefs = [
  ...readOnlyColDefs,
  {
    headerName: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    sortable: false,
    suppressMenu: true,
  },
];

export default readOnlyColDefs;

export {
  readOnlyColDefs,
  adminColDefs,
};
