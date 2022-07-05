const sampleColumnDefs = [
  {
    headerName: 'Sample',
    colId: 'Sample',
    field: 'Sample',
    hide: false,
  },
  {
    headerName: 'Sample Name',
    colId: 'Sample Name',
    field: 'Sample Name',
    hide: false,
  },
  {
    headerName: 'Collection Date',
    colId: 'Collection Date',
    field: 'Collection Date',
    hide: false,
  },
  {
    headerName: 'Primary Site',
    colId: 'Primary Site',
    field: 'Primary Site',
    hide: false,
  },
  {
    headerName: 'Biopsy Site',
    colId: 'Biopsy Site',
    field: 'Biopsy Site',
    hide: false,
  },
  {
    headerName: 'Pathology Estimated Tumour Content',
    colId: 'Patho TC',
    field: 'Patho TC',
    hide: false,
  },
];

const eventsColumnDefs = [
  {
    headerName: 'Genomic Events',
    colId: 'events',
    valueGetter: ({ data }) => data.variant,
    hide: false,
  },
  {
    headerName: 'Sample',
    colId: 'sample',
    field: 'sample',
    hide: false,
  },
  {
    headerName: 'Comments',
    colId: 'comments',
    field: 'comments',
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour DNA)',
    colId: 'tumourDna',
    field: 'tumourDna',
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour RNA)',
    colId: 'tumourRna',
    field: 'tumourRna',
    hide: false,
  },
  {
    headerName: 'Alt/Total (Normal DNA)',
    colId: 'normalDna',
    field: 'normalDna',
    hide: false,
  },
  {
    headerName: 'Actions',
    colId: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    hide: false,
    sortable: false,
    suppressMenu: true,
  },
];

export {
  sampleColumnDefs,
  eventsColumnDefs,
};
