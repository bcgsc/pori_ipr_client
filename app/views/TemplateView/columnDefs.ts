const columnDefs = [
  {
    headerName: 'Template Name',
    field: 'name',
    hide: false,
  },
  {
    headerName: 'Sections',
    field: 'sections',
    hide: false,
    cellRenderer: 'ArrayCellRenderer',
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
