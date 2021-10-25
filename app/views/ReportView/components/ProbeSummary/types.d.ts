import { RecordDefaults, GeneType } from '@/common';

type ProbeResultsType = {
  comments: string | null;
  gene: GeneType;
  sample: string | null;
  tumourDna?: string;
  tumourRna?: string;
  normalDna?: string;
  variant: string | null;
} & RecordDefaults;

export default ProbeResultsType;
