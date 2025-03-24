import { ColDef } from '@ag-grid-community/core';
import { basicTooltipValueGetter } from '../DataTable/components/ToolTip';
import CustomSetFilter from '../DataTable/components/CustomSetFilter';

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
  headerName: 'Matched Key Variants',
  field: 'matchedKeyVariant',
  tooltipValueGetter: basicTooltipValueGetter,
  filter: CustomSetFilter,
},
{
  headerName: 'Matched KB Variants',
  field: 'matchedKbVariant',
  tooltipValueGetter: basicTooltipValueGetter,
  filter: CustomSetFilter,
},
{
  headerName: 'Matched Small Mutations',
  field: 'matchedSmallMutation',
  tooltipValueGetter: basicTooltipValueGetter,
  filter: CustomSetFilter,
},
{
  headerName: 'Matched Structural Variants',
  field: 'matchedStructuralVariant',
  tooltipValueGetter: basicTooltipValueGetter,
  filter: CustomSetFilter,
},
{
  headerName: 'Matched Therapeutic Targets',
  field: 'matchedTherapeuticTarget',
  filter: CustomSetFilter,
},
{
  headerName: 'Context',
  field: 'matchedTherapeuticTargetContext',
  filter: CustomSetFilter,
},
{
  headerName: 'Patient ID',
  field: 'patientID',
  comparator: collator.compare,
  filter: false,
},
{
  headerName: 'Analysis Biopsy',
  field: 'analysisBiopsy',
},
{
  headerName: 'Report Type',
  field: 'reportType',
  filter: CustomSetFilter,
},
{
  headerName: 'State',
  field: 'state',
  filter: CustomSetFilter,
},
{
  headerName: 'Case Type',
  field: 'caseType',
  filter: CustomSetFilter,
},
{
  headerName: 'Project',
  field: 'project',
  tooltipComponent: 'ToolTip',
  tooltipValueGetter: basicTooltipValueGetter,
  filter: CustomSetFilter,
},
{
  headerName: 'Tumour Type',
  field: 'tumourType',
  tooltipComponent: 'ToolTip',
  tooltipValueGetter: basicTooltipValueGetter,
  filter: CustomSetFilter,
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
  filter: CustomSetFilter,
},
{
  headerName: 'Analyst',
  field: 'analyst',
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
  headerName: 'Date Created',
  field: 'date',
  sort: 'desc',
  cellRenderer: dateCellRenderer,
},
{
  headerName: 'Open',
  colId: 'Open',
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
