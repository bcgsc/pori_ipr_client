import { RecordDefaults, KbMatchType } from '@/common';

type StructuralVariantType = {
  breakpoint: string | null;
  conventionalName: string | null;
  ctermGene: string | null;
  ctermTranscript: string | null;
  detectedIn: string | null;
  eventType: string | null;
  exon1: string | null;
  exon2: string | null;
  gene1: Record<string, unknown> | null;
  gene2: Record<string, unknown> | null;
  highQuality: boolean;
  kbMatches: null | KbMatchType[];
  mavis_product_id: number | null;
  name: string | null;
  ntermGene: string | null;
  ntermTranscript: string | null;
  omicSupport: boolean;
  svg: string | null;
  svgTitle: string | null;
} & RecordDefaults;

export default StructuralVariantType;
