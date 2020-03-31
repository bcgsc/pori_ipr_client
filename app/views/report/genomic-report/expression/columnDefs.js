const columnDefs = [{
  headerName: 'Gene',
  field: 'gene.name',
  cellRenderer: 'GeneCellRenderer',
  hide: false,
}, {
  headerName: 'Type',
  field: 'expType',
  hide: false,
}, {
  headerName: 'Expression Class',
  field: 'expression_class',
  hide: false,
}, {
  headerName: 'Copy State',
  field: 'cnvState',
  hide: false,
}, {
  headerName: 'Normal Tissue',
  children: [
    { headerName: 'FC', field: 'foldChange', hide: false },
    { headerName: 'Perc', field: 'tcgaNormPerc', hide: false },
    { headerName: 'kIQR', field: 'tcgaNormkIQR', hide: false },
  ],
}, {
  headerName: 'Disease Tissue',
  children: [
    { headerName: 'Perc', field: 'tcgaPerc', hide: false },
    { headerName: 'kIQR', field: 'tcgakIQR', hide: false },
    { headerName: 'QC', field: 'tcgaQC', hide: false },
  ],
}, {
  headerName: 'Protein',
  children: [
    { headerName: 'Perc', field: 'ptxPerc', hide: true },
    { headerName: 'kIQR', field: 'ptxkIQR', hide: true },
    { headerName: 'QC', field: 'ptxQC', hide: true },
  ],
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

export default columnDefs;
