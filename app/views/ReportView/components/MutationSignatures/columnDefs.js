const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const columnDefs = [
  {
    headerName: 'Signature',
    valueGetter: 'data.signature.replace("Signature ", "")',
    hide: false,
    comparator: collator.compare,
    sort: 'asc',
    sortedAt: 1,
  },
  {
    headerName: 'NNLS',
    field: 'nnls',
    hide: false,
    sort: 'desc',
    sortedAt: 0,
  },
  {
    headerName: 'Proposed Association',
    field: 'associations',
    hide: false,
  },
  {
    headerName: 'Additional Features',
    field: 'features',
    hide: true,
  },
  {
    headerName: '# Cancer Types',
    field: 'numCancerTypes',
    hide: true,
  },
  {
    headerName: 'Significant Cancer Type',
    field: 'cancerTypes',
    hide: true,
  },
];

export default columnDefs;
