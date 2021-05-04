import { RecordDefaults, UserType } from '@/common';

type ProjectType = {
  name: string;
} & RecordDefaults;

type ReviewType = {
  comment: string | null;
  reviewer: UserType | null;
  type: string;
} & RecordDefaults;

type VariantType = {
  additionalInfo: string | null;
  alteration: string | null;
  cglCategory: string | null;
  chromosome: string | null;
  clinvar: string | null;
  dbSnp: string | null;
  familyHistory: string | null;
  fcBodymap: string | null;
  flagged: string | null;
  gene: string | null;
  geneExpressionRpkm: number | null;
  geneSomaticAbberation: string | null;
  gmaf: string | null;
  gtexCompPercentile: string | null;
  hgvsCdna: string | null;
  hgvsProtein: string | null;
  hidden: boolean;
  impact: string | null;
  notes: string | null;
  patientHistory: string | null;
  position: string | null;
  preferredTranscript: boolean;
  reference: string | null;
  rnaVariantReads: string | null;
  score: string | null;
  tcgaCompNormPercentile: string | null;
  tcgaCompPercentile: string | null;
  transcript: string | null;
  type: string | null;
  variant: string | null;
  zygosityGermline: string | null;
  zygosityTumour: string | null;
} & RecordDefaults;

type GermlineReportType = {
  biofxAssigned: UserType | null;
  biopsyName: string;
  exported: boolean;
  normalLibrary: string;
  patientId: string;
  projects: ProjectType[];
  reviews: ReviewType[];
  sourcePath: string;
  sourceVersion: string;
  variants: VariantType[];
} & RecordDefaults;

export {
  GermlineReportType,
  VariantType,
};
