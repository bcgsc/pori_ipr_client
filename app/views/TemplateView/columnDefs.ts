import { ColDef } from '@ag-grid-community/core';
import { actionsColDef } from '@/utils/actionsColumnDef';

const columnDefs: ColDef[] = [
  {
    headerName: 'Template Name',
    field: 'name',
    hide: false,
  },
  {
    headerName: 'Sections',
    flex: 1,
    autoHeight: true,
    wrapText: true,
    valueGetter: 'data.sections.join(", ")',
    hide: false,
  },
  {
    headerName: 'Signature Types',
    flex: 1,
    autoHeight: true,
    wrapText: true,
    valueGetter: 'data.signatureTypes.map((val)=>val.signatureType).join(", ")',
    hide: false,
  },
  {
    ...actionsColDef,
  },
];

export default columnDefs;
