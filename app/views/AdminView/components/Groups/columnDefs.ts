import { ColDef } from '@ag-grid-community/core';
import { basicTooltipValueGetter } from '@/components/DataTable/components/ToolTip';

const descriptions = {
  admin: 'all access',
  'all projects access': 'access to all projects',
  'template edit access': 'can create/edit/delete report templates',
  'appendix edit access': 'can create/edit/delete template appendix text',
  'unreviewed access': 'can view reports that have not been reviewed',
  'non-production access': 'can view reports that have non-production status',
  'germline access': 'can view germline reports',
  'report assignment access': 'can assign users to reports; bioinformatician',
  'create report access': 'can load new reports',
  'variant-text edit access': 'can create/edit/delete specific variant-text',
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
    tooltipComponent: 'ToolTip',
    tooltipValueGetter: basicTooltipValueGetter,
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
