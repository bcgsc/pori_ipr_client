import { ColDef } from '@ag-grid-community/core';
import { basicTooltipValueGetter } from '../DataTable/components/ToolTip';
import CustomSetFilter from '../DataTable/components/CustomSetFilter';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const dateCellRenderer = (params) => new Intl.DateTimeFormat('en-ca', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date(params.value));

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
  headerName: 'Matched Therapy',
  field: 'matchedTherapy',
  filter: CustomSetFilter,
},
{
  headerName: 'Context',
  field: 'matchedTherapyContext',
  filter: CustomSetFilter,
},
{
  headerName: 'Mutation Signature',
  field: 'matchedMutationSignature',
  filter: CustomSetFilter,
},
// DEVSU-2824 postponing MSI status search until hardcoded thresholds are reworked
// {
//   headerName: 'MSI Score',
//   field: 'matchedMsiScore',
// },
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
