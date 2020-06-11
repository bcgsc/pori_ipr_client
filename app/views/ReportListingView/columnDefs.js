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

const columnDefs = [{
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
},
{
  headerName: 'Tumour Type',
  field: 'tumourType',
},
{
  headerName: 'Report ID',
  field: 'reportIdent',
},
{
  headerName: 'Physician',
  field: 'physician',
  hide: true,
},
{
  headerName: 'Analyst',
  field: 'analyst',
  hide: true,
},
{
  headerName: 'Date Created',
  field: 'date',
  sort: 'desc',
  cellRenderer: dateCellRenderer,
}];

// Show physician to external users, analyst to internal

export default columnDefs;
