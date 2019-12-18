const columnDefs = [{
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
  colId: 'disease',
  hide: false,
  valueGetter: (params) => {
    if (params.data.disease.size > 1) {
      console.log(params.data.disease);
      return [...params.data.disease].join(', ');
    }
    return params.data.disease;
  },
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
},
{
  headerName: 'Effect',
  field: 'effect',
  colId: 'effect',
  hide: true,
},
{
  headerName: 'Evidence',
  field: 'evidence',
  colId: 'evidence',
  hide: true,
},
{
  headerName: 'Matched Cancer',
  field: 'matched_cancer',
  colId: 'matched_cancer',
  hide: true,
},
{
  headerName: 'Sample',
  field: 'sample',
  colId: 'sample',
  hide: true,
},
{
  headerName: 'Zygosity',
  field: 'zygosity',
  colId: 'zygosity',
  hide: true,
}];

const targetedColumnDefs = [{
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
  columnDefs,
  targetedColumnDefs,
};
