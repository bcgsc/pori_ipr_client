const columnDefs = [{
  colId: 'drag',
  rowDrag: true,
  rowDragText: params => params.rowNode.data.gene,
  hide: true,
  pinned: 'left',
  suppressMenu: true,
  width: 40,
}, {
  headerName: 'Gene',
  field: 'gene',
  hide: false,
  cellRenderer: 'GeneCellRenderer',
}, {
  headerName: 'Variant',
  field: 'variant',
  hide: false,
}, {
  headerName: 'Therapy',
  field: 'therapy',
  hide: false,
}, {
  headerName: 'Context',
  field: 'context',
  hide: false,
}, {
  headerName: 'Evidence Level',
  field: 'evidenceLevel',
  hide: false,
}, {
  headerName: 'Notes',
  field: 'notes',
  hide: false,
}, {
  colId: 'rank',
  field: 'rank',
  hide: true,
  sort: 'asc',
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

export default columnDefs;
