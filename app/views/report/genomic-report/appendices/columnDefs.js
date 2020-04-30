const sampleInformationColumnDefs = [{
  headerName: 'Type',
  field: 'Sample',
  hide: false,
}, {
  headerName: 'Sample Name',
  field: 'Sample Name',
  hide: false,
}, {
  headerName: 'Collection Date',
  field: 'Collection Date',
  hide: false,
}, {
  headerName: 'Primary Site',
  field: 'Primary Site',
  hide: false,
}, {
  headerName: 'Biopsy Site',
  field: 'Biopsy Site',
  hide: false,
}, {
  headerName: 'Pathology Estimated Tumour Content',
  field: 'Patho TC',
  hide: false,
}];

const sequencingProtocolInformationColumnDefs = [{
  headerName: 'Type',
  field: 'Sample',
  hide: false,
}, {
  headerName: 'Sample Name',
  field: 'Sample Name',
  hide: false,
}, {
  headerName: 'Input (ng)',
  field: 'Input_ng',
  hide: false,
}, {
  headerName: 'Library Construction Protocol',
  field: 'Protocol',
  hide: false,
}, {
  headerName: 'Library',
  field: 'Library',
  hide: false,
}, {
  headerName: 'Lab QC',
  field: 'labQC',
  hide: false,
}, {
  headerName: 'Sequencing QC',
  field: 'bioQC',
  hide: false,
}, {
  headerName: '% Duplicates',
  field: 'Duplicate_Reads_Perc',
  hide: false,
}, {
  headerName: 'Total Coverage',
  field: 'Coverage',
  hide: false,
}, {
  headerName: '# Reads',
  field: 'Reads',
  hide: false,
}];

const tcgaAcronymsColumnDefs = [{
  headerName: 'Code Name',
  field: 'Code Name',
  hide: false,
}, {
  headerName: 'Full Name',
  field: 'Full Name',
  hide: false,
}, {
  headerName: 'Data Source',
  field: 'Data Source',
  hide: false,
}, {
  headerName: 'Tumour Count',
  field: 'Tumour Count',
  hide: false,
}, {
  headerName: 'Normal Count',
  field: 'Normal Count',
  hide: false,
}];

export default {
  sampleInformationColumnDefs,
  sequencingProtocolInformationColumnDefs,
  tcgaAcronymsColumnDefs,
};
