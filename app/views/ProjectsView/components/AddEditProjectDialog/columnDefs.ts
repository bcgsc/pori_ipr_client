import { actionsColDef } from '@/utils/actionsColumnDef';

const userColumnDefs = [
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

const reportColumnDefs = [
  {
    headerName: 'Patient ID',
    field: 'patientId',
    hide: false,
  },
  {
    headerName: 'Report ID',
    field: 'ident',
    hide: false,
  },
  {
    ...actionsColDef,
  },
];

export {
  userColumnDefs,
  reportColumnDefs,
};
