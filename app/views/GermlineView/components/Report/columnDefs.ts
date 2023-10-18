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
    hide: false,
  },
  {
    headerName: 'CGL Category',
    field: 'cglCategory',
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
    field: 'dbSnpIds',
    hide: false,
  },
  {
    field: 'clinvarIds',
    minWidth: 80,
    hide: false,
  },
  {
    field: 'cosmicIds',
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
    hide: true,
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
    hide: true,
    width: 400,
  },
  {
    headerName: 'Family History',
    field: 'familyHistory',
    autoHeight: true,
    wrapText: true,
    hide: true,
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
    width: 900,
    autoHeight: true,
    wrapText: true,
    hide: true,
  },
  {
    headerName: 'Gene Expression RPKM',
    field: 'geneExpressionRpkm',
    hide: false,
  },
  {
    headerName: 'CGL Review Result',
    field: 'cglReviewResult',
  },
  {
    headerName: 'Variant Returned to Clinician',
    field: 'returnedToClinician',
  },
  {
    headerName: 'Referral HCP',
    field: 'referralHcp',
  },
  {
    headerName: 'Known To HCP',
    field: 'knownToHcp',
  },
  {
    headerName: 'No HCP Referral Reason',
    field: 'reasonNoHcpReferral',
  },
  {
    headerName: 'Reported in PCP-TGR',
    field: 'previouslyReported',
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      placeContent: 'center',
    },
    valueGetter: ({ data: { previouslyReported } }) => {
      if (previouslyReported) {
        return previouslyReported;
      }
      return 'not set';
    },
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
