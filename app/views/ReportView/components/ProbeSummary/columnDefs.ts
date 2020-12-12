const sampleColumnDefs = [
  {
    headerName: 'Sample',
    field: 'Sample',
    hide: false,
  },
  {
    headerName: 'Sample Name',
    field: 'Sample Name',
    hide: false,
  },
  {
    headerName: 'Collection Date',
    field: 'Collection Date',
    hide: false,
  },
  {
    headerName: 'Primary Site',
    field: 'Primary Site',
    hide: false,
  },
  {
    headerName: 'Biopsy Site',
    field: 'Biopsy Site',
    hide: false,
  },
  {
    headerName: 'Pathology Estimated Tumour Content',
    field: 'Patho TC',
    hide: false,
  },
];

const eventsColumnDefs = [
  {
    headerName: 'Genomic Events',
    valueGetter: 'data.gene.name + " (" + data.variant + ")"',
    hide: false,
  },
  {
    headerName: 'Comments',
    field: 'comments',
    flex: 1,
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
