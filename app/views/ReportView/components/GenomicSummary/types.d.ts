import { RecordDefaults } from '@/common';

type PatientInformationType = {
  label: string;
  value: string | null;
};

type GeneVariantType = {
  geneVariant: string;
  type?: string;
} & RecordDefaults;

export {
  PatientInformationType,
  GeneVariantType,
};
