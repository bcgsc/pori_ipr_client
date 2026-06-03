import { actionsColDef } from '@/utils/actionsColumnDef';

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
    headerName: 'Authority',
    field: 'type',
    hide: false,
  },
  {
    ...actionsColDef,
  },
];

export default columnDefs;
