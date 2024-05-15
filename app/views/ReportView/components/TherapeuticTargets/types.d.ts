import { RecordDefaults } from '@/common';

type TherapeuticType = {
  context: string;
  contextGraphkbId: string | null;
  evidenceLevel: string;
  iprEvidenceLevel: string | null;
  evidenceLevelGraphkbId: string | null;
  gene: string;
  geneGraphkbId: string | null;
  kbStatementIds: string | null;
  notes: string | null;
  rank: number;
  signature: string | null;
  signatureGraphkbId: string | null;
  therapy: string | null;
  therapyGraphkbId: string | null;
  type: string;
  variant: string;
  variantGraphkbId: string | null;
} & RecordDefaults;

export default TherapeuticType;
