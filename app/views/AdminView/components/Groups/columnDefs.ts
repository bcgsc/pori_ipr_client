import { formatDate } from '@/utils/date';
// TODO replace wraptext with tooltips

const descriptions = {
  'admin': 'all access',
  'all projects access': 'access to all projects',
  'template edit access': 'can create/edit/delete report templates',
  'appendix edit access': 'can create/edit/delete template appendix text',
  'unreviewed access': 'can view reports that have not been reviewed',
  'non-production access': 'can view reports that have non-production status',
  'germline access': 'can view germline reports',
  'report manager': 'can assign users to reports',
  'read access': 'can read reports',
  'bioinformatician': 'can read and be assigned to reports',
  'manager': 'can create/edit/delete nonadmin users; template edit access; appendix edit access; unreviewed access; nonproduction access; germline access; report manager; read access; bioinformatician'
}

const columnDefs = [
  {
    headerName: 'Group Name',
    valueGetter: ({data}) => data.name.toLowerCase(),
    hide: false,
  },
  {
    headerName: 'Description',
    valueGetter: ({data}) => data.description? data.description : descriptions[data.name.toLowerCase()] ? descriptions[data.name.toLowerCase()] : '',
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
