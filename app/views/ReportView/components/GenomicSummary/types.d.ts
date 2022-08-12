import { RecordDefaults } from '@/common';

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
  PatientInformationType,
  TumourSummaryType,
  GeneVariantType,
  MicrobialType,
};
