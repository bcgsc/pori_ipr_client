import { formatDate } from '@/utils/date';
import { ValueGetterParams } from '@ag-grid-community/core';

const columnDefs = [
  {
    headerName: 'Patient',
    field: 'patientId',
    hide: false,
  },
  {
    headerName: 'Project',
    valueGetter: ({ data }: ValueGetterParams): string => (
      data.projects.map(({ name }) => name).join(', ')
    ),
    hide: false,
  },
  {
    headerName: 'Biopsy',
    field: 'biopsyName',
    hide: false,
  },
  {
    headerName: 'Version',
    field: 'sourceVersion',
    hide: false,
  },
  {
    headerName: 'BioFX Reviewer',
    valueGetter: ({ data }: ValueGetterParams): string => {
      if (data.biofxAssigned) {
        return `${data.biofxAssigned.firstName} ${data.biofxAssigned.lastName}`;
      }
      return null;
    },
    hide: false,
  },
  {
    headerName: 'BioFX Review',
    valueGetter: ({ data }: ValueGetterParams): boolean => {
      if (data.reviews.find(({ type }) => type === 'biofx')) {
        return true;
      }
      return false;
    },
    cellRenderer: 'checkboxCellRenderer',
    hide: false,
  },
  {
    headerName: 'Projects Review',
    valueGetter: ({ data }: ValueGetterParams): boolean => {
      if (data.reviews.find(({ type }) => type === 'projects')) {
        return true;
      }
      return false;
    },
    cellRenderer: 'checkboxCellRenderer',
    hide: false,
  },
  {
    headerName: 'Exported',
    field: 'exported',
    cellRenderer: 'checkboxCellRenderer',
    cellRendererParams: { isExportCell: true },
    filter: 'reviewFilter',
    hide: false,
  },
  {
    cellRenderer: 'checkboxCellRenderer',
    headerName: 'CGL Review Result',
    valueGetter: ({ data }: ValueGetterParams): boolean => {
      if (data.reviews.find(({ type }) => type === 'cgl')) {
        return true;
      }
      return false;
    },
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }: ValueGetterParams): string => formatDate(data.createdAt),
    hide: false,
  },
  {
    headerName: 'Open',
    pinned: 'right',
    cellRenderer: 'Launch',
    cellRendererParams: {
      url: (ident: string): string => `/germline/report/${ident}`,
    },
    suppressSizeToFit: true,
    sortable: false,
    resizable: false,
    suppressMenu: true,
    width: 50,
  },
];

export default columnDefs;
