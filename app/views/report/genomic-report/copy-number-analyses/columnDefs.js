const columnDefs = [{
  headerName: 'Gene',
  cellRenderer: 'GeneCellRenderer',
  field: 'gene.name',
  hide: false,
}, {
  headerName: 'Copy Change',
  field: 'ploidyCorrCpChange',
  hide: false,
}, {
  headerName: 'LOH State',
  field: 'lohState',
  hide: false,
}, {
  headerName: 'CNV State',
  field: 'cnvState',
  hide: false,
}, {
  headerName: 'Chr:band',
  field: 'chromosomeBand',
  hide: false,
}, {
  headerName: 'CNV Start',
  field: 'start',
  hide: false,
}, {
  headerName: 'CNV End',
  field: 'end',
  hide: false,
}, {
  headerName: 'Size (Mb)',
  field: 'size',
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
  field: 'gene.knownFusionPartner',
  hide: true,
}, {
  headerName: 'Action',
  colId: 'action',
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
