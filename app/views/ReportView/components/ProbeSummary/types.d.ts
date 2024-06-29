import { RecordDefaults, GeneType } from '@/common';

type ProbeResultsType = {
  comments: string | null;
  gene: GeneType;
  sample: string | null;
  variant: string | null;
  tumourDna: string;
  tumourRna: string;
  normalDna: string;
} & RecordDefaults;

export default ProbeResultsType;
