const colDefs = [{
  headerName: 'Gene',
  field: 'gene',
  colId: 'gene',
  hide: false,
},
{
  headerName: 'Known Variant',
  field: 'kbVariant',
  colId: 'kbVariant',
  hide: false,
},
{
  headerName: 'Cancer Type',
  field: 'disease',
  colId: 'disease',
  hide: false,
},
{
  headerName: 'Disease Percentile',
  field: 'expression_cancer_percentile',
  colId: 'expression_cancer_percentile',
  hide: false,
},
{
  headerName: 'Association',
  field: 'association',
  colId: 'association',
  hide: false,
},
{
  headerName: 'Context',
  field: 'therapeuticContext',
  colId: 'therapeuticContext',
  hide: false,
},
{
  headerName: 'PMID',
  field: 'reference',
  colId: 'reference',
  hide: false,
},
{
  headerName: 'LOH Region',
  field: 'LOHRegion',
  colId: 'LOHRegion',
  hide: true,
},
{
  headerName: 'Alteration Type',
  field: 'alterationType',
  colId: 'alterationType',
  hide: true,
},
{
  headerName: 'Approved Therapy',
  field: 'approvedTherapy',
  colId: 'approvedTherapy',
  hide: true,
},
{
  headerName: 'Copy Number',
  field: 'copyNumber',
  colId: 'copyNumber',
  hide: true,
}];

const targetedColDefs = [{
  headerName: 'Gene',
  field: 'gene',
  hide: false,
},
{
  headerName: 'Variant',
  field: 'variant',
  hide: false,
},
{
  headerName: 'Source',
  field: 'sample',
  hide: false,
}];

export {
  colDefs,
  targetedColDefs,
};
