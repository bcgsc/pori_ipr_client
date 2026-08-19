import { formatDate } from '@/utils/date';
import { actionsColDef } from '@/utils/actionsColumnDef';

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
    ...actionsColDef,
  },
];

export default readOnlyColDefs;

export {
  readOnlyColDefs,
  adminColDefs,
};
