import { formatDate } from '../../../../utils/date';

const columnDefs = [
  {
    headerName: 'Name',
    field: 'name',
    hide: false,
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    hide: false,
  },
];

export default columnDefs;
