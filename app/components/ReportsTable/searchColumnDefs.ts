import { ColDef } from '@ag-grid-community/core';
import { basicTooltipValueGetter } from '../DataTable/components/ToolTip';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const dateCellRenderer = (params) => {
  const gui = document.createElement('span');
  const date = new Date(params.value);
  const formattedDate = new Intl.DateTimeFormat('en-ca', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  gui.innerHTML = formattedDate;
  return gui;
};

const searchColumnDefs: ColDef[] = [{
  headerName: 'Matched Variant',
  field: 'matchedVariant',
},
{
  headerName: 'Patient ID',
  field: 'patientID',
  comparator: collator.compare,
},
{
  headerName: 'Analysis Biopsy',
  field: 'analysisBiopsy',
},
{
  headerName: 'Report Type',
  field: 'reportType',
},
{
  headerName: 'State',
  field: 'state',
},
{
  headerName: 'Case Type',
  field: 'caseType',
},
{
  headerName: 'Project',
  field: 'project',
  tooltipComponent: 'ToolTip',
  tooltipValueGetter: basicTooltipValueGetter,
},
{
  headerName: 'Tumour Type',
  field: 'tumourType',
  tooltipComponent: 'ToolTip',
  tooltipValueGetter: basicTooltipValueGetter,
},
{
  headerName: 'Report ID',
  field: 'reportIdent',
  tooltipComponent: 'ToolTip',
  tooltipValueGetter: basicTooltipValueGetter,
},
{
  headerName: 'Physician',
  field: 'physician',
  tooltipComponent: 'ToolTip',
  tooltipValueGetter: basicTooltipValueGetter,
},
{
  headerName: 'Analyst',
  field: 'analyst',
},
{
  headerName: 'Date Created',
  field: 'date',
  sort: 'desc',
  cellRenderer: dateCellRenderer,
},
{
  headerName: 'Bioinformatician',
  field: 'bioinformatician',
},
{
  headerName: 'Assigned Reviewer',
  field: 'reviewer',
},
{
  headerName: 'Biopsy Type',
  field: 'biopsyType',
},
{
  headerName: 'Open',
  pinned: 'right',
  cellRenderer: 'Launch',
  cellRendererParams: {
    url: (ident) => `/report/${ident}/summary`,
  },
  suppressSizeToFit: true,
  sortable: false,
  resizable: false,
  suppressMenu: true,
  width: 50,
}];

// Show physician to external users, analyst to internal

export default searchColumnDefs;
