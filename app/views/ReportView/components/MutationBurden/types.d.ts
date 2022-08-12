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

type TmburType = {
  tumour: string;
  normal: string;
  nonNBasesIn1To22AndXAndY: string;
  totalGenomeSnvs: number;
  totalGenomeIndels: number;
  genomeSnvTmb: number;
  genomeIndelTmb: number;
  cdsBasesIn1To22AndXAndY: string;
  cdsSnvs: number,
  cdsIndels: number;
  cdsSnvTmb: number;
  cdsIndelTmb: number;
  proteinSnvs: number;
  proteinIndels: number;
  proteinSnvTmb: number;
  proteinIndelTmb: number;
  msiScore: number;
} & RecordDefaults;

type MsiType = {
  score: number | null;
  kbCategory: string | null;
} & RecordDefaults;

export {
  ComparatorType,
  MutationBurdenType,
  TmburType,
  MsiType,
};
