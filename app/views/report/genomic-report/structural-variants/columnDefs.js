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
  headerName: 'Fold Change vs Average',
  field: 'foldChange',
  hide: false,
}, {
  field: 'tcgaPerc',
  hide: false,
}];

export const setHeaderName = (header) => {
  const index = columnDefs.findIndex(obj => obj.field === 'tcgaPerc');
  columnDefs[index].headerName = `${header} %ile`;
};

export default columnDefs;
