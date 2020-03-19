const columnDefs = [{
  headerName: 'Gene',
  field: 'gene.name',
  hide: false,
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
  colId: 'copyChange',
  valueGetter: params => (
    params.data.ploidyCorrCpChange === 'na' || !params.data.ploidyCorrCpChange
      ? 'na'
      : params.data.ploidyCorrCpChange.match(/(((\+|-)?)[0-9]{1,2})/g)[0]),
  hide: false,
}, {
  headerName: 'LOH State',
  field: 'lohState',
  hide: false,
}, {
  headerName: 'Ref/Alt DNA',
  field: 'tumourReads',
  hide: false,
}, {
  headerName: 'Ref/Alt RNA',
  field: 'RNAReads',
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
  headerName: 'SARC %ile',
  field: 'TCGAPerc',
  hide: false,
}];

export default columnDefs;
