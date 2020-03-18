import ArrayCell from './ArrayCell';

const columnDefs = [{
  headerName: 'Gene',
  field: 'gene',
  hide: false,
},
{
  headerName: 'Known Variant',
  field: 'kbVariant',
  hide: false,
},
{
  headerName: 'Observed Variant',
  field: 'variant',
  hide: false,
},
{
  headerName: 'Cancer Type',
  field: 'disease',
  hide: false,
  cellRendererFramework: ArrayCell('disease', false),
  valueGetter: (params) => {
    if (typeof params.data.disease === 'object') {
      const diseaseString = [...params.data.disease].sort().toString();
      return diseaseString;
    }
    return params.data.disease;
  },
},
{
  headerName: 'Disease Percentile',
  field: 'expressionCancerPercentile',
  hide: false,
},
{
  headerName: 'Association',
  field: 'relevance',
  hide: false,
},
{
  headerName: 'Context',
  field: 'context',
  hide: false,
},
{
  headerName: 'PMID',
  field: 'reference',
  hide: false,
  cellRendererFramework: ArrayCell('reference', true),
  valueGetter: (params) => {
    if (typeof params.data.reference === 'object') {
      const referenceString = [...params.data.reference].sort().toString();
      return referenceString;
    }
    return params.data.reference;
  },
},
{
  headerName: 'LOH Region',
  field: 'LOHRegion',
  hide: true,
},
{
  headerName: 'Category',
  field: 'category',
  hide: true,
},
{
  headerName: 'Copy Number',
  field: 'copyNumber',
  hide: true,
},
{
  headerName: 'Effect',
  field: 'effect',
  hide: true,
},
{
  headerName: 'Evidence',
  field: 'evidenceLevel',
  hide: true,
},
{
  headerName: 'Matched Cancer',
  field: 'matchedCancer',
  hide: true,
},
{
  headerName: 'Sample',
  field: 'sample',
  hide: false,
},
{
  headerName: 'Zygosity',
  field: 'zygosity',
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
