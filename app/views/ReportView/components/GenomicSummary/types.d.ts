import { RecordDefaults } from '@/common';

type MsiType = {
  score: number;
  kbCategory: null | string;
};

type PatientInformationType = {
  label: string;
  value: string | null;
};

type TumourSummaryType = {
  term: string;
  value: string | null;
  action?: () => void | null;
};

type GeneVariantType = {
  geneVariant: string;
  type?: string;
} & RecordDefaults;

type MicrobialType = {
  integrationSite: string | null;
  species: string | null;
} & RecordDefaults;

export {
  MsiType,
  PatientInformationType,
  TumourSummaryType,
  GeneVariantType,
  MicrobialType,
};
