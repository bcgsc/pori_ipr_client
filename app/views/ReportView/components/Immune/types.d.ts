import { RecordDefaults } from '@/common';

type ImmuneType = {
  cellType: string | null;
  kbCategory: string | null;
  percentile: number | null;
  score: number | null;
} & RecordDefaults;

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
  ImmuneType,
  HlaType,
};
