const columnDefs = [
  {
    headerName: '',
    hide: false,
    cellRenderer: 'strikethroughCell',
    minWidth: 100,
  },
  {
    headerName: 'Flagged',
    field: 'flagged',
    hide: false,
  },
  {
    headerName: 'ClinVar',
    field: 'clinvar',
    hide: true,
  },
  {
    headerName: 'CGL Category',
    field: 'cglCategory',
    hide: true,
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
    headerName: 'Genomic Variant Reads',
    field: 'genomicVariantReads',
    hide: true,
  },
  {
    headerName: 'RNA Variant Reads',
    field: 'rnaVariantReads',
    hide: true,
  },
  {
    headerName: 'Gene Somatic Abberation?',
    field: 'geneSomaticAbberation',
    hide: true,
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
    autoHeight: true,
    wrapText: true,
    hide: false,
    width: 300,
  },
  {
    headerName: 'Type',
    field: 'type',
    hide: false,
  },
  {
    headerName: 'Patient History',
    field: 'patientHistory',
    autoHeight: true,
    wrapText: true,
    hide: false,
    width: 400,
  },
  {
    headerName: 'Family History',
    field: 'familyHistory',
    autoHeight: true,
    wrapText: true,
    hide: false,
    width: 400,
  },
  {
    headerName: 'tgca_comp_norm_percentile',
    field: 'tcgaCompNormPercentile',
    hide: true,
  },
  {
    headerName: 'tcga_comp_percentile',
    field: 'tcgaCompPercentile',
    hide: true,
  },
  {
    headerName: 'gtex_comp_average_percentile',
    field: 'gtexCompPercentile',
    hide: true,
  },
  {
    headerName: 'fc_bodymap',
    field: 'fcBodymap',
    hide: true,
  },
  {
    headerName: 'Additional Info',
    field: 'additionalInfo',
    hide: true,
  },
  {
    headerName: 'Gene Expression RPKM',
    field: 'geneExpressionRpkm',
    hide: false,
  },
  {
    headerName: 'Actions',
    cellRenderer: 'actionCell',
    pinned: 'right',
    sortable: false,
    suppressMenu: true,
  },
];

export default columnDefs;
