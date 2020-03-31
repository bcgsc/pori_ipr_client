const columnDefs = [{
  headerName: 'Gene',
  field: 'gene.name',
  hide: false,
  cellRenderer: 'GeneCellRenderer',
}, {
  headerName: 'Transcript',
  field: 'transcript',
  hide: false,
}, {
  headerName: 'Protein Change',
  field: 'proteinChange',
  hide: false,
}, {
  headerName: 'Location',
  field: 'location',
  hide: false,
}, {
  headerName: 'Zygosity',
  field: 'zygosity',
  hide: false,
}, {
  headerName: 'Ref/Alt',
  field: 'refAlt',
  hide: false,
}, {
  headerName: 'Copy Change',
  field: 'gene.cnv.ploidyCorrCpChange',
  hide: false,
}, {
  headerName: 'LOH State',
  field: 'gene.cnv.lohState',
  hide: false,
}, {
  headerName: 'Ref/Alt DNA',
  field: 'tumourReads',
  hide: false,
}, {
  headerName: 'Ref/Alt RNA',
  field: 'rnaReads',
  hide: false,
}, {
  headerName: 'Expression (RPKM)',
  field: 'gene.outlier.rpkm',
  hide: false,
}, {
  colId: 'foldChange',
  field: 'gene.outlier.foldChange',
  hide: false,
}, {
  colId: 'tcgaPerc',
  field: 'gene.outlier.tcgaPerc',
  hide: false,
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

export const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex(obj => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export default columnDefs;
