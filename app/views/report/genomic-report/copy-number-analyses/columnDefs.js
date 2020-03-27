const columnDefs = [{
  headerName: 'Gene',
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
  field: 'expressionRpkm',
  hide: false,
}, {
  colId: 'foldChange',
  field: 'foldChange',
  hide: false,
}, {
  colId: 'tcgaPerc',
  field: 'tcgaPerc',
  hide: false,
}];

export const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex(obj => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export default columnDefs;
