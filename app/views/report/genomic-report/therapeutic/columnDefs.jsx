const columnDefs = [{
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
  field: 'rank',
  hide: true,
  sort: 'asc',
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
}];

export default columnDefs;
