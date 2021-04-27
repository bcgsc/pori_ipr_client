import { RecordDefaults, GeneType } from '@/common';

type ProbeResultsType = {
  comments: string | null;
  gene: GeneType;
  sample: string | null;
  variant: string | null;
} & RecordDefaults;

export default ProbeResultsType;
