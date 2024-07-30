import { RecordDefaults, UserType, ProjectType } from '@/common';

type ReviewType = {
  comment: string | null;
  reviewer: UserType | null;
  type: string;
} & RecordDefaults;

type VariantType = {
  additionalInfo: string | null;
  alteration: string | null;
  cglCategory: string | null;
  cglReviewResult: 'pathogenic' | 'likely pathogenic' | 'VUS' | 'likely benign' | 'benign' | null;
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
  knownToHcp: 'yes' | 'no' | null;
  notes: string | null;
  patientHistory: string | null;
  position: string | null;
  preferredTranscript: boolean;
  previouslyReported: string | null;
  reasonNoHcpReferral: string | null;
  reference: string | null;
  referralHcp: 'yes' | 'no' | null;
  returnedToClinician: 'yes' | 'no' | null;
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
  projects: ({
    description: string | null;
    name: string | null;
  } & RecordDefaults)[];
  reviews: ReviewType[];
  sourcePath: string;
  sourceVersion: string;
  variants: VariantType[];
} & RecordDefaults;

type GermlineReportContextType = {
  /** Current report that's being viewed */
  report: GermlineReportType | null,
  /** Set new current report */
  setReport: React.Dispatch<React.SetStateAction<GermlineReportType>>;
};

export {
  GermlineReportContextType,
  GermlineReportType,
  VariantType,
};
