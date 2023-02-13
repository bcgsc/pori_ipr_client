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
    headerName: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    sortable: false,
    suppressMenu: true,
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
    headerName: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    sortable: false,
    suppressMenu: true,
  },
];

export {
  userColumnDefs,
  reportColumnDefs,
};
