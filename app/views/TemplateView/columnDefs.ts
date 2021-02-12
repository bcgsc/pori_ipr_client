const columnDefs = [
  {
    headerName: 'Template Name',
    field: 'name',
    hide: false,
  },
  {
    headerName: 'Sections',
    valueGetter: 'data.sections.join(", ")',
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
