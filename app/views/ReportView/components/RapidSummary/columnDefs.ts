const clinicalAssociationColDefs = [
  {
    headerName: 'Genomic Events',
    colId: 'genomicEvents',
    field: 'genomicEvents',
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour DNA)',
    colId: 'Alt/Total (Tumour DNA)',
    valueGetter: ({ data: { variant: { tumourAltCount, tumourDepth } } }) => {
      if (tumourAltCount !== null && tumourDepth !== null) {
        return `${tumourAltCount}/${tumourDepth}`;
      }
      return '';
    },
    hide: false,
  },
  {
    headerName: 'Potential Clinical Association',
    colId: 'relevance',
    field: 'relevance',
    hide: false,
  },
];

const cancerRelevanceColDefs = [
  {
    headerName: 'Genomic Events',
    colId: 'genomicEvents',
    field: 'genomicEvents',
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour DNA)',
    colId: 'Alt/Total (Tumour DNA)',
    valueGetter: ({ data: { variant: { tumourAltCount, tumourDepth } } }) => {
      if (tumourAltCount && tumourDepth) {
        return `${tumourAltCount}/${tumourDepth}`;
      }
      return '';
    },
    hide: false,
  },
];

const sampleColumnDefs = [
  {
    headerName: 'Sample',
    colId: 'Sample',
    field: 'Sample',
    hide: false,
  },
  {
    headerName: 'Sample Name',
    colId: 'Sample Name',
    field: 'Sample Name',
    hide: false,
  },
  {
    headerName: 'Collection Date',
    colId: 'Collection Date',
    field: 'Collection Date',
    hide: false,
  },
  {
    headerName: 'Primary Site',
    colId: 'Primary Site',
    field: 'Primary Site',
    hide: false,
  },
  {
    headerName: 'Biopsy Site',
    colId: 'Biopsy Site',
    field: 'Biopsy Site',
    hide: false,
  },
  {
    headerName: 'Pathology Estimated Tumour Content',
    colId: 'Patho TC',
    field: 'Patho TC',
    hide: false,
  },
];

export {
  sampleColumnDefs,
  clinicalAssociationColDefs,
  cancerRelevanceColDefs,
};
