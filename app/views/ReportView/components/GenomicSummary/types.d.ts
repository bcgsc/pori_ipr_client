import { RecordDefaults } from '@/common';

type PatientInformationType = {
  label: string;
  value: string | null;
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
  GeneVariantType,
  MicrobialType,
};
