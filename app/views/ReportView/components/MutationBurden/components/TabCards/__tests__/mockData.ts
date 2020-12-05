const comparators = [
  {
    analysisRole: 'mutation burden (primary)',
    createdAt: '',
    description: '',
    ident: '',
    name: 'TCGA',
    size: null,
    updatedAt: null,
    version: null,
  },
  {
    analysisRole: 'mutation burden SV (primary)',
    createdAt: '',
    description: '',
    ident: '',
    name: 'POG',
    size: null,
    updatedAt: null,
    version: null,
  },
  {
    analysisRole: 'mutation burden (secondary)',
    createdAt: '',
    description: '',
    ident: '',
    name: 'TCGA',
    size: null,
    updatedAt: null,
    version: null,
  },
];

const mutationBurden = [
  {
    codingIndelPercentile: 24,
    codingIndelsCount: 1,
    codingSnvCount: 10,
    codingSnvPercentile: 10,
    createdAt: 'now',
    frameshiftIndelsCount: 1,
    ident: 'e',
    qualitySvCount: 53,
    qualitySvExpressedCount: 14,
    qualitySvPercentile: 92,
    role: 'primary',
    totalIndelCount: null,
    totalMutationsPerMb: 1.98,
    totalSnvCount: null,
    truncatingSnvCount: 1,
    updatedAt: '',
  },
  {
    codingIndelPercentile: 24,
    codingIndelsCount: 1,
    codingSnvCount: 10,
    codingSnvPercentile: 10,
    createdAt: 'now',
    frameshiftIndelsCount: 1,
    ident: 'e',
    qualitySvCount: 53,
    qualitySvExpressedCount: 14,
    qualitySvPercentile: 92,
    role: 'secondary',
    totalIndelCount: null,
    totalMutationsPerMb: 1.98,
    totalSnvCount: null,
    truncatingSnvCount: 1,
    updatedAt: '',
  },
];

const barplots = [
  {
    caption: null,
    createdAt: '',
    data: 'base64stringhere',
    filename: 'mockimage',
    format: 'PNG',
    ident: '',
    key: 'mutationBurden.snv.primary',
    title: 'SNV barplot image',
    updatedAt: '',
  },
];

const densities = [
  {
    caption: null,
    createdAt: '',
    data: 'base64stringhere',
    filename: 'mockimage',
    format: 'PNG',
    ident: '',
    key: 'mutationBurden.snv.primary',
    title: 'SNV density image',
    updatedAt: '',
  },
];

const legends = [
  {
    caption: null,
    createdAt: '',
    data: 'base64stringhere',
    filename: 'mockimage',
    format: 'PNG',
    ident: '',
    key: 'mutationBurden.snv.primary',
    title: 'SNV legend image',
    updatedAt: '',
  },
];

export {
  comparators,
  mutationBurden,
  barplots,
  densities,
  legends,
};
