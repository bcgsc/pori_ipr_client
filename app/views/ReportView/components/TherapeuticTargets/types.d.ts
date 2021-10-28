import { RecordDefaults } from '@/common';

type TherapeuticTargetType = {
  context: string;
  contextGraphkbId: string | null;
  evidenceLevel: string;
  evidenceLevelGraphkbId: string | null;
  gene: string;
  geneGraphkbId: string | null;
  kbStatementIds: string | null;
  notes: string | null;
  rank: number;
  therapy: string;
  therapyGraphkbId: string | null;
  type: 'therapeutic' | 'chemoresistance';
  variant: string;
  variantGraphkbId: string | null;
} & RecordDefaults;

export default TherapeuticTargetType;
