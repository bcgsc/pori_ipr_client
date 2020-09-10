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
    hide: false,
  },
];

export {
  sampleColumnDefs,
  eventsColumnDefs,
};
