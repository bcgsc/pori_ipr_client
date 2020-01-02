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
  valueGetter: (params) => {
    if (typeof params.data.disease === 'object') {
      const diseaseString = [...params.data.disease].sort().toString();
      return diseaseString;
    }
    return params.data.disease;
  },
  cellRendererFramework: (params) => {
    let diseaseString = params.data.disease;
    if (typeof diseaseString === 'object') {
      diseaseString = [...params.data.disease].sort().toString();
    }
    return (
      <>
        {diseaseString.split(',').map(val => (
          <div key={val}>
            {val}
            <br />
          </div>
        ))}
      </>
    );
  },
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
  valueGetter: (params) => {
    if (typeof params.data.reference === 'object') {
      const referenceString = [...params.data.reference].sort().toString();
      return referenceString;
    }
    return params.data.reference;
  },
  cellRendererFramework: (params) => {
    let referenceString = params.data.reference;
    if (typeof referenceString === 'object') {
      referenceString = [...params.data.reference].sort().toString();
    }
    return (
      <>
        {referenceString.split(',').map(val => (
          <div key={val}>
            <a
              href={(val.replace('#', '').match(/^\d+$/))
                ? `https://ncbi.nlm.nih.gov/pubmed/${val.replace('#', '')}`
                : `http://${val.replace('#', '')}`
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              {val.replace('#', '')}
            </a>
            <br />
          </div>
        ))}
      </>
    );
  },
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
