import { formatDate } from '@/utils/date';

const columnDefs = [
  {
    headerName: 'Patient',
    field: 'patientId',
    hide: false,
  },
  {
    headerName: 'Project',
    valueGetter: ({ data }) => data.projects.map(({ name }) => name).join(', '),
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
    valueGetter: ({ data }) => {
      if (data.biofxAssigned) {
        return `${data.biofxAssigned.firstName} ${data.biofxAssigned.lastName}`;
      }
    },
    hide: false,
  },
  {
    headerName: 'BioFX Review',
    valueGetter: ({ data }) => {
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
    valueGetter: ({ data }) => {
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
    filter: 'reviewFilter',
    hide: false,
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    hide: false,
  },
];

export default columnDefs;
