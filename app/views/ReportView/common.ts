import { ColDef } from '@ag-grid-community/core';

const sampleColumnDefs: ColDef[] = [
  {
    headerName: 'Sample',
    colId: 'sample',
    field: 'sample',
    hide: false,
  },
  {
    headerName: 'Sample Name',
    colId: 'sampleName',
    field: 'sampleName',
    hide: false,
  },
  {
    headerName: 'Collection Date',
    colId: 'collectionDate',
    field: 'collectionDate',
    hide: false,
  },
  {
    headerName: 'Primary Site',
    colId: 'primarySite',
    field: 'primarySite',
    hide: false,
  },
  {
    headerName: 'Biopsy Site',
    colId: 'biopsySite',
    field: 'biopsySite',
    hide: false,
  },
  {
    headerName: 'Pathology Estimated Tumour Content',
    colId: 'pathoTc',
    field: 'pathoTc',
    hide: false,
  },
];

export {
  sampleColumnDefs,
};
