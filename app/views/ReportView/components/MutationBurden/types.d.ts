import { RecordDefaults } from '@/common';

type ComparatorType = {
  analysisRole: string;
  description: string | null;
  name: string;
  size: number | null;
  version: string | null;
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
  TmburType,
  MsiType,
};
