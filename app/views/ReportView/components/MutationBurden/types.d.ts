import { RecordDefaults } from '@/common';

type ComparatorType = {
  analysisRole: string;
  description: string | null;
  name: string;
  size: number | null;
  version: string | null;
} & RecordDefaults;

type MutationBurdenType = {
  codingIndelPercentile: number | null;
  codingIndelsCount: number | null;
  codingSnvCount: number | null;
  codingSnvPercentile: number | null;
  frameshiftIndelsCount: number | null;
  qualitySvCount: number | null;
  qualitySvExpressedCount: number | null;
  qualitySvPercentile: number | null;
  role: string;
  totalIndelCount: number | null;
  totalMutationsPerMb: number | null;
  totalSnvCount: number | null;
  truncatingSnvCount: number | null;
} & RecordDefaults;

export {
  ComparatorType,
  MutationBurdenType,
};
