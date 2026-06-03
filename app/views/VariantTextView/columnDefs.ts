import { formatDate } from '@/utils/date';
import { ColDef } from '@ag-grid-community/core';
import { DisplayMode } from '@/components/DataTable/components/HTMLCellRenderer';
import { actionsColDef } from '@/utils/actionsColumnDef';

const columnDefs: ColDef[] = [
  {
    headerName: 'Template Name',
    field: 'template.name',
  },
  {
    headerName: 'Project',
    valueGetter: ({ data }) => data.project?.name,
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
    headerName: 'Cancer Types',
    valueGetter: ({ data }) => data.cancerType?.join(', '),
    autoHeight: true,
    wrapText: true,
    maxWidth: 200,
  },
  {
    headerName: 'Text',
    cellRenderer: 'HTMLCellRenderer',
    cellRendererParams: {
      mode: DisplayMode.compact,
    },
    flex: 1,
    wrapText: true,
    cellStyle: { overflow: 'auto' },
  },
  {
    ...actionsColDef,
  },
];

export default columnDefs;
