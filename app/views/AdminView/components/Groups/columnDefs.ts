import { ColDef } from '@ag-grid-community/core';

const descriptions = {
  admin: 'all access',
  'all projects access': 'access to all projects',
  'template edit access': 'can create/edit/delete report templates',
  'appendix edit access': 'can create/edit/delete template appendix text',
  'unreviewed access': 'can view reports that have not been reviewed',
  'non-production access': 'can view reports that have non-production status',
  'germline access': 'can view germline reports',
  'report manager': 'can assign users to reports; bioinformatician',
  'read access': 'can read reports',
  bioinformatician: 'can read and be assigned to reports; non-production access; unreviewed access',
  manager: 'can create/edit/delete nonadmin users; all other permissions within assigned projects',
};

const columnDefs: ColDef[] = [
  {
    headerName: 'Group Name',
    valueGetter: ({ data }) => data.name.toLowerCase(),
    hide: false,
  },
  {
    headerName: 'Description',
    valueGetter: ({ data }) => {
      if (data.description) {
        return data.description;
      }
      if (descriptions[data.name.toLowerCase()]) {
        return descriptions[data.name.toLowerCase()];
      }
      return '';
    },
    hide: false,
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
