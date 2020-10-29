import { formatDate } from '../../../../utils/date';

const columnDefs = [
  {
    headerName: 'Username',
    field: 'username',
    hide: false,
  },
  {
    headerName: 'Name',
    field: 'name',
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
];

export default columnDefs;
