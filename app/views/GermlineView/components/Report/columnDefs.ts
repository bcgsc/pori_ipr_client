const columnDefs = [
  {
    headerName: 'Flagged',
    field: 'flagged',
    hide: false,
  },
  {
    headerName: 'GMAF',
    field: 'gmaf',
    hide: false,
  },
  {
    headerName: 'Transcript',
    field: 'transcript',
    hide: false,
  },
  {
    headerName: 'Gene',
    field: 'gene',
    hide: false,
  },
  {
    headerName: 'Variant',
    field: 'variant',
    hide: false,
  },
  {
    headerName: 'Impact',
    field: 'impact',
    hide: false,
  },
  {
    headerName: 'Chr',
    field: 'chromosome',
    hide: false,
  },
  {
    headerName: 'Pos',
    field: 'position',
    hide: false,
  },
  {
    headerName: 'dbSNP',
    field: 'dbSnp',
    hide: false,
  },
  {
    headerName: 'Ref',
    field: 'reference',
    hide: false,
  },
  {
    headerName: 'Alt',
    field: 'alteration',
    hide: false,
  },
  {
    headerName: 'Score',
    field: 'score',
    hide: false,
  },
  {
    headerName: 'Zygosity in Germline',
    field: 'zygosityGermline',
    hide: false,
  },
  {
    headerName: 'Preferred Transcript',
    field: 'preferredTranscript',
    hide: false,
  },
  {
    headerName: 'HGVS-cDNA',
    field: 'hgvsCdna',
    hide: false,
  },
  {
    headerName: 'HGVS-protein',
    field: 'hgvsProtein',
    hide: false,
  },
  {
    headerName: 'Zygosity in Tumour',
    field: 'zygosityTumour',
    hide: false,
  },
  {
    headerName: 'Notes',
    field: 'notes',
    hide: false,
  },
  {
    headerName: 'Type',
    field: 'type',
    hide: false,
  },
  {
    autoHeight: true,
    cellClass: 'cell-wrap-text',
    headerName: 'Patient History',
    field: 'patientHistory',
    hide: false,
  },
  {
    headerName: 'Family History',
    field: 'familyHistory',
    hide: false,
  },
  {
    headerName: 'Gene Expression RPKM',
    field: 'geneExpressionRpkm',
    hide: false,
  },
];

export default columnDefs;
