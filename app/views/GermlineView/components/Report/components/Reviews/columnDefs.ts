import { formatDate } from '@/utils/date';
import { ICellRendererParams } from '@ag-grid-community/core';

const columnDefs = [
  {
    headerName: 'Reviewer',
    valueGetter: 'data.reviewer.firstName + " " + data.reviewer.lastName',
    hide: false,
  },
  {
    headerName: 'Comments',
    field: 'comment',
    valueFormatter: (params: ICellRendererParams): string => params.data.comment || 'None',
    hide: false,
  },
  {
    headerName: 'Type',
    field: 'type',
    hide: false,
  },
  {
    headerName: 'Reviewed',
    field: 'createdAt',
    valueFormatter: (params: ICellRendererParams): string => formatDate(params.data.createdAt),
    hide: false,
  },
  {
    headerName: '',
    width: 50,
    cellRenderer: 'deleteCell',
  },
];

export default columnDefs;
