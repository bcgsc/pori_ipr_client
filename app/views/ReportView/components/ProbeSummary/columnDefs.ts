import { sampleColumnDefs } from '../../common';

const eventsColumnDefs = [
  {
    headerName: 'Genomic Events',
    colId: 'events',
    valueGetter: ({ data }) => {
      if (/^(enst)|(nm_)/i.test(data.variant)) {
        return `${data.gene.name} (${data.variant})`;
      }
      return data.variant;
    },
    hide: false,
  },
  {
    headerName: 'Sample',
    colId: 'sample',
    field: 'sample',
    hide: false,
  },
  {
    headerName: 'Comments',
    colId: 'comments',
    field: 'comments',
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour DNA)',
    colId: 'tumourDna',
    field: 'tumourDna',
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour RNA)',
    colId: 'tumourRna',
    field: 'tumourRna',
    hide: false,
  },
  {
    headerName: 'Alt/Total (Normal DNA)',
    colId: 'normalDna',
    field: 'normalDna',
    hide: false,
  },
  {
    headerName: 'Actions',
    colId: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    hide: false,
    sortable: false,
    suppressMenu: true,
  },
];

export {
  sampleColumnDefs,
  eventsColumnDefs,
};
