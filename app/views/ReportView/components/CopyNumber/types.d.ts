import { RecordDefaults, KbMatchType } from '@/common';

type GeneType = {
  cancerRelated: boolean;
  drugTargetable: boolean;
  expressionVariants: Record<string, unknown>;
  knownFusionPartner: boolean;
  knownSmallMutation: boolean;
  name: string;
  oncogene: boolean;
  therapeuticAssociated: boolean;
  tumourSuppressor: boolean;
};

type CopyNumberType = {
  chromosomeBand: string | null;
  cna: string | null;
  cnvState: string | null;
  copyChange: number | null;
  end: number | null;
  gene: GeneType | null;
  kbCategory: string | null;
  kbMatches: KbMatchType[];
  log2Cna: string | null;
  lohState: string | null;
  size: number | null;
  start: number | null;
} & RecordDefaults;

export default CopyNumberType;
