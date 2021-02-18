import { RecordDefaults } from '@/common';

type ImageType = {
  caption: string | null;
  data: string;
  filename: string;
  format: string;
  key: string;
  title: string | null;
} & RecordDefaults;

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

type MsiType = {
  score: number | null;
  kbCategory: string | null;
} & RecordDefaults;

export {
  ImageType,
  ComparatorType,
  MutationBurdenType,
  MsiType,
};
