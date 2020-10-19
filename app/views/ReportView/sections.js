const genomic = [
  {
    name: 'Summary',
    uri: 'summary',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Analyst Comments',
    uri: 'analyst-comments',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Pathway Analysis',
    uri: 'pathway-analysis',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Potential Therapeutic Targets',
    uri: 'therapeutic-targets',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Knowledgebase Matches',
    uri: 'kb-matches',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Presentation',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [
      { name: 'Additional Information', uri: 'slides' },
      { name: 'Discussion Notes', uri: 'discussion' },
    ],
  },
  {
    name: 'Detailed Genomic Analysis',
    meta: false,
    showChildren: false,
    clinician: true,
    category: true,
    children: [
      { name: 'Microbial', uri: 'microbial' },
      { name: 'Expression Correlation', uri: 'expression-correlation' },
      { name: 'Mutation Signatures', uri: 'mutation-signatures' },
      { name: 'Mutation Burden', uri: 'mutation-burden' },
    ],
  },
  {
    name: 'Somatic',
    meta: false,
    showChildren: false,
    clinician: true,
    category: true,
    children: [
      { name: 'Small Mutations', uri: 'small-mutations' },
      { name: 'Copy Number Analyses', uri: 'copy-number' },
      { name: 'Structural Variants', uri: 'structural-variants' },
    ],
  },
  {
    name: 'Expression',
    uri: 'expression',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Immune Microenvironment',
    uri: 'immune',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Appendices',
    uri: 'appendices',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Report Settings',
    uri: 'settings',
    meta: true,
    showChildren: false,
    clinician: false,
    children: [],
  },
];

const probe = [
  {
    name: 'Summary',
    uri: 'summary',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Knowledgebase Matches',
    uri: 'kb-matches',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Appendices',
    uri: 'appendices',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [],
  },
  {
    name: 'Report Settings',
    uri: 'settings',
    meta: true,
    showChildren: false,
    clinician: false,
    children: [],
  },
];

export {
  genomic,
  probe,
};
