import { formatDate } from '@/utils/date';
import { ColDef } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  {
    headerName: 'Name',
    field: 'template.name',
  },
  {
    headerName: 'Org',
    field: 'template.organization',
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
    cellRenderer: ({ data }) => `${data.text.substring(0,300)}....` || '',
    flex: 1,
    autoHeight: true,
    wrapText: true,
  },
  {
    headerName: 'Project',
    field: 'project.name',
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
