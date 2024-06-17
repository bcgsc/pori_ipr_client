const columnDefs = [
  {
    headerName: 'Patient ID',
    field: 'patientId',
    cellRenderer: 'HyperlinkCellRenderer',
    hide: false,
  },
  {
    headerName: 'Library Name',
    field: 'library',
    hide: false,
  },
  {
    headerName: 'Tumour Type',
    field: 'tumourType',
    hide: false,
  },
  {
    headerName: 'Tissue Type',
    field: 'tissueType',
    hide: false,
  },
  {
    headerName: 'Tumour Content',
    field: 'tumourContent',
    valueFormatter: (params) => `${params.value}%`,
    hide: false,
  },
  {
    headerName: 'Correlation',
    field: 'correlation',
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

export default columnDefs;
