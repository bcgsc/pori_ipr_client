import React from 'react';

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
  headerName: 'Cancer Type',
  field: 'disease',
  hide: false,
  cellRendererFramework: params => (
    <>
      {[...params.data.disease].map(val => (
        <div key={val}>
          {val}
          <br />
        </div>
      ))}
    </>
  ),
},
{
  headerName: 'Disease Percentile',
  field: 'expression_cancer_percentile',
  hide: false,
},
{
  headerName: 'Association',
  field: 'association',
  hide: false,
},
{
  headerName: 'Context',
  field: 'therapeuticContext',
  hide: false,
},
{
  headerName: 'PMID',
  field: 'reference',
  hide: false,
  cellRendererFramework: params => (
    <>
      {[...params.data.reference].map(val => (
        <div key={val}>
          {val}
          <br />
        </div>
      ))}
    </>
  ),
},
{
  headerName: 'LOH Region',
  field: 'LOHRegion',
  hide: true,
},
{
  headerName: 'Alteration Type',
  field: 'alterationType',
  hide: true,
},
{
  headerName: 'Approved Therapy',
  field: 'approvedTherapy',
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
  field: 'evidence',
  hide: true,
},
{
  headerName: 'Matched Cancer',
  field: 'matched_cancer',
  hide: true,
},
{
  headerName: 'Sample',
  field: 'sample',
  hide: true,
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
