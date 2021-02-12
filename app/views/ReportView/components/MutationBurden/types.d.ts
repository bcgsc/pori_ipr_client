import { recordDefaults } from '@/common';

type imageType = {
  caption: string | null;
  data: string;
  filename: string;
  format: string;
  key: string;
  title: string | null;
} & recordDefaults;

type comparatorType = {
  analysisRole: string;
  description: string | null;
  name: string;
  size: number | null;
  version: string | null;
} & recordDefaults;

type mutationBurdenType = {
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
} & recordDefaults;

type msiType = {
  score: number | null;
  kbCategory: string | null;
} & recordDefaults;

export {
  imageType,
  comparatorType,
  mutationBurdenType,
  msiType,
};
