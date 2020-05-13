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
  field: 'gene.copyVariants.ploidyCorrCpChange',
  hide: false,
}, {
  headerName: 'LOH State',
  field: 'gene.copyVariants.lohState',
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
  field: 'gene.expressionVariants.rpkm',
  hide: false,
}, {
  colId: 'foldChange',
  field: 'gene.expressionVariants.foldChange',
  hide: false,
}, {
  colId: 'tcgaPerc',
  field: 'gene.expressionVariants.tcgaPerc',
  hide: false,
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}, {
  headerName: 'Oncogene',
  colId: 'oncogene',
  field: 'gene.oncogene',
  hide: true,
}, {
  headerName: 'Tumour Suppressor',
  colId: 'tumourSuppressor',
  field: 'gene.tumourSuppressor',
  hide: true,
}, {
  headerName: 'Cancer Related',
  colId: 'cancerRelated',
  field: 'gene.cancerRelated',
  hide: true,
}, {
  headerName: 'Known Fusion Partner',
  colId: 'knownFusionPartner',
  field: 'gene.knownFusionParter',
  hide: true,
}];

export const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex(obj => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export default columnDefs;
