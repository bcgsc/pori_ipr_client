import { RecordDefaults } from '@/common';

type ComparatorType = {
  analysisRole: string;
  description: string | null;
  name: string;
  size: number | null;
  version: string | null;
} & RecordDefaults;

export {
  ComparatorType,
};
