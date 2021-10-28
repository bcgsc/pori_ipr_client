import { RecordDefaults, ComparatorType } from '@/common';

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

type MsiType = {
  score: number | null;
  kbCategory: string | null;
} & RecordDefaults;

export {
  MutationBurdenType,
  MsiType,
  ComparatorType,
};
