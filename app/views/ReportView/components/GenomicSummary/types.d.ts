import { RecordDefaults } from '@/common';
import { VariantType } from '@/common';

type GeneVariantType = {
  geneVariant: string;
  type?: string;
  variantType?: string;
  variant?: VariantType;
} & RecordDefaults;

export {
  GeneVariantType,
};
