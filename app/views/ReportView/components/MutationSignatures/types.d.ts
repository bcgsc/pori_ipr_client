import { RecordDefaults } from '@/common';

type MutationSignatureType = {
  associations: string | null;
  cancerTypes: string | null;
  features: string | null;
  kbCategory: string | null;
  nnls: number | null;
  numCancerTypes: number | null;
  pearson: number | null;
  selected: boolean;
  signature: string | null;
} & RecordDefaults;

export default MutationSignatureType;
