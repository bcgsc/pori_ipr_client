import { formatDate } from '@/utils/date';
import { ColDef } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  {
    headerName: 'Template Name',
    field: 'template.name',
  },
  {
    headerName: 'Project',
    cellRenderer: ({ data }) => data.project?.name,
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    minWidth: 90,
  },
  {
    headerName: 'Updated',
    valueGetter: ({ data }) => formatDate(data.updatedAt),
    minWidth: 90,
  },
  {
    headerName: 'Variant Name',
    valueGetter: ({ data }) => data.variantName,
    minWidth: 90,
  },
  {
    headerName: 'Cancer Type',
    valueGetter: ({ data }) => data.cancerType,
    minWidth: 90,
  },
  {
    headerName: 'Text',
    cellRenderer: ({ data }) => data.text,
    flex: 1,
    autoHeight: true,
    wrapText: true,
  },
  {
    headerName: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    sortable: false,
    suppressMenu: true,
  },
];

export default columnDefs;
