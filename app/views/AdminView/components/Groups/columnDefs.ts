import { formatDate } from '../../../../utils/date';

const columnDefs = [
  {
    headerName: 'Group Name',
    field: 'name',
    hide: false,
  },
  {
    headerName: 'Owner',
    valueGetter: ({ data }) => `${data.owner.firstName} ${data.owner.lastName}`,
    hide: false,
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    hide: false,
  },
];

export default columnDefs;
