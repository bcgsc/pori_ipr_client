import { RecordDefaults } from '@/common';

type HlaType = {
  a1: string;
  a2: string;
  b1: string;
  b2: string;
  c1: string;
  c2: string;
  library: string;
  objective: number;
  pathology: string;
  protocol: string;
  reads: number;
} & RecordDefaults;

export {
  HlaType,
};
