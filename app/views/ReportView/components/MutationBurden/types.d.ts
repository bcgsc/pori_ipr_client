type imageType = {
  caption: string | null,
  createdAt: string,
  data: string,
  filename: string,
  format: string,
  ident: string,
  key: string,
  title: string | null,
  updatedAt: string,
};

type comparatorType = {
  analysisRole: string,
  createdAt: string,
  description: string | null,
  ident: string,
  name: string,
  size: number | null,
  updatedAt: string,
  version: string | null,
};

type mutationBurdenType = {
  codingIndelPercentile: number | null,
  codingIndelsCount: number | null,
  codingSnvCount: number | null,
  codingSnvPercentile: number | null,
  createdAt: string,
  frameshiftIndelsCount: number | null,
  ident: string,
  qualitySvCount: number | null,
  qualitySvExpressedCount: number | null,
  qualitySvPercentile: number | null,
  role: string,
  totalIndelCount: number | null,
  totalMutationsPerMb: number | null,
  totalSnvCount: number | null,
  truncatingSnvCount: number | null,
  updatedAt: string | null,
};

export {
  imageType,
  comparatorType,
  mutationBurdenType,
};
