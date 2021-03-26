import { RecordDefaults } from '@/common';

type MutationType = {
  altSeq: string | null;
  chromosome: number | null;
  endPosition: number | null;
  gene: Record<string, unknown>;
  germline: string | null;
  hgvsCds: string | null;
  hgvsProtein: string | null;
  kbMatches: Record<string, unknown>[];
  ncbiBuild: string | null;
  normalAltCount: number | null;
  normalDepth: number | null;
  normalRefCount: number | null;
  proteinChange: string | null;
  refSeq: string | null;
  rnaAltCount: number | null;
  rnaDepth: number | null;
  rnaRefCount: number | null;
  startPosition: number | null;
  transcript: string | null;
  tumourAltCount: number | null;
  tumourDepth: number | null;
  tumourRefCount: number | null;
  zygosity: string | null;
} & RecordDefaults;

export default MutationType;
