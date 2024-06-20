import { formatDate } from '@/utils/date';
import { ColDef } from '@ag-grid-community/core';
import { DisplayMode } from '@/components/DataTable/components/HTMLCellRenderer';

const columnDefs: ColDef[] = [
  {
    headerName: 'Template Name',
    field: 'template.name',
  },
  {
    headerName: 'Project',
    cellRenderer: ({ data }) => data.project?.name || '(default appendix text)',
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
    headerName: 'Appendix Text',
    cellRenderer: 'HTMLCellRenderer',
    cellRendererParams: {
      mode: DisplayMode.compact,
    },
    flex: 1,
    wrapText: true,
    cellStyle: { overflow: 'auto' },
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
