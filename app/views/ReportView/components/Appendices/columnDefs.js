const sequencingProtocolInformationColumnDefs = [{
  headerName: 'Type',
  field: 'Sample',
  colId: 'Type',
  hide: false,
}, {
  headerName: 'Sample Name',
  field: 'Sample Name',
  colId: 'Sample Name',
  hide: false,
}, {
  headerName: 'Input (ng)',
  field: 'Input_ng',
  colId: 'Input_ng',
  hide: false,
}, {
  headerName: 'Library Construction Protocol',
  field: 'Protocol',
  colId: 'Protocol',
  hide: false,
}, {
  headerName: 'Library',
  field: 'Library',
  colId: 'Library',
  hide: false,
}, {
  headerName: 'Lab QC',
  field: 'labQC',
  colId: 'labQC',
  hide: false,
}, {
  headerName: 'Sequencing QC',
  field: 'bioQC',
  colId: 'bioQC',
  hide: false,
}, {
  headerName: '% Duplicates',
  field: 'Duplicate_Reads_Perc',
  colId: 'Duplicate_Reads_Perc',
  hide: false,
}, {
  headerName: 'Total Coverage',
  field: 'Coverage',
  colId: 'Coverage',
  hide: false,
}, {
  headerName: '# Reads',
  field: 'Reads',
  colId: 'Reads',
  hide: false,
}];

const tcgaAcronymsColumnDefs = [{
  headerName: 'Code Name',
  field: 'Code Name',
  colId: 'Code Name',
  hide: false,
}, {
  headerName: 'Full Name',
  field: 'Full Name',
  colId: 'Full Name',
  hide: false,
}, {
  headerName: 'Data Source',
  field: 'Data Source',
  colId: 'Data Source',
  hide: false,
}, {
  headerName: 'Tumour Count',
  field: 'Tumour Count',
  colId: 'Tumour Count',
  hide: false,
}, {
  headerName: 'Normal Count',
  field: 'Normal Count',
  colId: 'Normal Count',
  hide: false,
}];

export {
  sequencingProtocolInformationColumnDefs,
  tcgaAcronymsColumnDefs,
};
