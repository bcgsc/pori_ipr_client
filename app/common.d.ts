/* eslint-disable camelcase */
declare module '*.scss';

declare let CONFIG: {
  ATTRS: {
    NAME: string;
  },
  STORAGE: {
    REFERRER: string;
    KEYCLOAK: string;
  },
};

declare global {
  interface Window {
    _env_: {
      KEYCLOAK_CLIENT_ID: string;
      KEYCLOAK_REALM: string;
      KEYCLOAK_URL: string;
      GRAPHKB_URL: string;
      API_BASE_URL: string;
      CONTACT_EMAIL: string;
      CONTACT_TICKET_URL: string;
      IS_DEMO: boolean;
      PUBLIC_PATH: string;
    };
  }
  let CONFIG: {
    ATTRS: {
      NAME: string;
    },
    STORAGE: {
      REFERRER: string;
      KEYCLOAK: string;
      DATABASE_TYPE: string;
    },
  };
}

type RecordDefaults = {
  ident: string;
  updatedAt: string | null;
  createdAt: string | null;
};

type UserGroupMemberType = {
  createdAt: string;
  deletedAt: null | string;
  group_id: number;
  id: number;
  updatedAt: null | string;
  user_id: number;
} & RecordDefaults;

type GroupType = {
  ident: string;
  name: string;
  users: UserGroupMemberType[];
  owner: UserType;
  description: string;
};

type UserProjectsType = {
  ident: string;
  name: string;
  user_project: {
    createdAt: string;
    deletedAt: null | string;
    id: number;
    project_id: number;
    updatedAt: null | string;
    user_id: number;
  },
};

type UserType = {
  email: string;
  deletedAt: null | string;
  firstName: string;
  groups?: GroupType[];
  lastLogin: null | string;
  lastName: string;
  projects?: UserProjectsType[];
  type: string;
  username: string;
  allowNotifications: boolean;
} & RecordDefaults;

type ShortReportType = {
  alternateIdentifier: string | null;
  patientId: string;
} & RecordDefaults;

type ProjectType = {
  name: string;
  description?: string;
  reportProject?: {
    additionalProject: boolean;
  };
  users?: UserType[];
} & RecordDefaults;

type AppendixType = {
  template: TemplateType;
  project: {
    name: string | null;
    description: string | null;
  } & RecordDefaults;
  text: string;
} & RecordDefaults;

export type VariantTextType = {
  cancerType: string[];
  project: {
    ident: string | null;
    name: string | null;
  };
  template: TemplateType;
  text: string;
  variantName: string;
} & RecordDefaults;

type ImageType = {
  caption: string | null;
  data: string;
  filename: string;
  format: string;
  key: string;
  title: string | null;
} & RecordDefaults;

type GeneType = {
  kbStatementRelated: boolean;
  drugTargetable: boolean;
  knownFusionPartner: boolean;
  knownSmallMutation: boolean;
  name: string;
  oncogene: boolean;
  therapeuticAssociated: boolean;
  tumourSuppressor: boolean;
};

type AnyVariantType = 'cnv' | 'mut' | 'sv' | 'exp' | 'msi' | 'tmb';

type VariantTypeMap<T extends AnyVariantType> = {
  'cnv': CopyNumberType;
  'mut': SmallMutationType;
  'sv': StructuralVariantType;
  'exp': ExpOutliersType;
  'msi': MsiType;
  'tmb': TmburType;
}[T];

type KbMatchType<T extends AnyVariantType = AnyVariantType> = {
  approvedTherapy: boolean;
  category: string;
  context: string;
  disease: string;
  evidenceLevel: string;
  externalSource: string;
  externalStatementId: string;
  inferred: boolean;
  iprEvidenceLevel: string;
  kbData: {
    inferred: boolean;
    recruitment_status: string;
  } | null;
  kbStatementId: string;
  kbVariant: string;
  kbVariantId: string;
  matchedCancer: boolean;
  pmidRef: string;
  reference: string;
  relevance: string;
  reviewStatus: string;
  sample: string | null;
  status: string | null;
  variant?: VariantTypeMap<T>;
  variantType: T;
} & RecordDefaults;

type CopyNumberType = {
  chromosomeBand: string | null;
  cna: string | null;
  cnvState: string | null;
  comments: string | null;
  copyChange: number | null;
  displayName: string | null;
  end: number | null;
  gene: GeneType | null;
  kbCategory: string | null;
  kbMatches?: KbMatchType<'cnv'>[];
  log2Cna: string | null;
  lohState: string | null;
  selected: boolean;
  size: number | null;
  start: number | null;
  variantType: 'cnv';
} & RecordDefaults;

type StructuralVariantType = {
  breakpoint: string | null;
  comments: string | null;
  conventionalName: string | null;
  ctermGene: string | null;
  ctermTranscript: string | null;
  detectedIn: string | null;
  displayName: string | null;
  eventType: string | null;
  exon1: string | null;
  exon2: string | null;
  frame: string | null;
  gene1: GeneType | null;
  gene2: GeneType | null;
  highQuality: boolean;
  kbMatches?: KbMatchType<'sv'>[];
  mavis_product_id: number | null;
  name: string | null;
  ntermGene: string | null;
  ntermTranscript: string | null;
  omicSupport: boolean;
  selected: boolean;
  svg: string | null;
  svgTitle: string | null;
  variantType: 'sv';
} & RecordDefaults;

type SmallMutationType = {
  altSeq: string | null;
  chromosome: number | null;
  comments: string | null;
  displayName: string | null;
  endPosition: number | null;
  gene: GeneType;
  germline: string | null;
  hgvsCds: string | null;
  hgvsGenomic: string | null;
  hgvsProtein: string | null;
  kbMatches?: KbMatchType<'mut'>[];
  library: string | null;
  ncbiBuild: string | null;
  normalAltCount: number | null;
  normalDepth: number | null;
  normalRefCount: number | null;
  proteinChange: string | null;
  refSeq: string | null;
  rnaAltCount: number | null;
  rnaDepth: number | null;
  rnaRefCount: number | null;
  selected: boolean;
  startPosition: number | null;
  transcript: string | null;
  tumourAltCopies: number | null;
  tumourAltCount: number | null;
  tumourDepth: number | null;
  tumourRefCopies: number | null;
  tumourRefCount: number | null;
  zygosity: string | null;
  variantType: 'mut';
} & RecordDefaults;

type ExpOutliersType = {
  biopsySiteFoldChange: number | null;
  biopsySitePercentile: number | null;
  biopsySiteQC: number | null;
  biopsySiteZScore: number | null;
  biopsySitekIQR: number | null;
  diseaseFoldChange: number | null;
  diseasePercentile: number | null;
  diseaseQC: number | null;
  diseaseZScore: number | null;
  diseasekIQR: number | null;
  expressionState: string | null;
  gene: GeneType;
  kbCategory: string | null;
  location: number | null;
  primarySiteFoldChange: number | null;
  primarySitePercentile: number | null;
  primarySiteQC: number | null;
  primarySiteZScore: number | null;
  primarySitekIQR: number | null;
  rnaReads: number | null;
  rpkm: number | null;
  selected: boolean;
  tpm: number | null;
  variantType: 'exp';
} & RecordDefaults;

type TmburType = {
  adjustedTmb: number | null;
  adjustedTmbComment: string | null;
  cdsBasesIn1To22AndXAndY: string;
  cdsIndels: number;
  cdsIndelTmb: number;
  cdsSnvs: number,
  cdsSnvTmb: number;
  comments: string;
  genomeSnvTmb: number;
  genomeIndelTmb: number;
  tmbHidden: boolean;
  kbCategory: string | null;
  kbMatches: KbMatchType[];
  msiScore: number;
  nonNBasesIn1To22AndXAndY: string;
  normal: string;
  proteinIndels: number;
  proteinIndelTmb: number;
  proteinSnvs: number;
  proteinSnvTmb: number;
  totalGenomeIndels: number;
  totalGenomeSnvs: number;
  tumour: string;
  variantType: 'tmb';
} & RecordDefaults;

type MsiType = {
  score: number | null;
  kbCategory: string | null;
  variantType: 'msi';
} & RecordDefaults;

type TemplateType = {
  name: string;
  headerImage: ImageType;
  logoImage: ImageType;
  organization: string;
  sections: string[];
} & RecordDefaults;

type TumourSummaryType = {
  term: string;
  value: string | null;
  action?: () => void | null;
};

type MutationBurdenType = {
  codingIndelPercentile: number | null;
  codingIndelsCount: number | null;
  codingSnvCount: number | null;
  codingSnvPercentile: number | null;
  frameshiftIndelsCount: number | null;
  qualitySvCount: number | null;
  qualitySvExpressedCount: number | null;
  qualitySvPercentile: number | null;
  role: string;
  totalIndelCount: number | null;
  totalMutationsPerMb: number | null;
  totalSnvCount: number | null;
  truncatingSnvCount: number | null;
} & RecordDefaults;

type ImmuneType = {
  cellType: string | null;
  kbCategory: string | null;
  percentile: number | null;
  score: number | null;
  pedsPercentile: number | null;
  pedsScore: number | null;
  pedsScoreComment: string | null;
  percentileHidden: boolean;
} & RecordDefaults;

type MicrobialType = {
  integrationSite: string | null;
  species: string | null;
} & RecordDefaults;

export {
  RecordDefaults,
  ShortReportType,
  ProjectType,
  AppendixType,
  VariantTextType,
  UserType,
  TemplateType,
  AnyVariantType,
  GroupType,
  UserProjectsType,
  UserGroupMemberType,
  ImageType,
  GeneType,
  KbMatchType,
  CopyNumberType,
  StructuralVariantType,
  SmallMutationType,
  ExpOutliersType,
  TumourSummaryType,
  TmburType,
  MsiType,
  MutationBurdenType,
  ImmuneType,
  MicrobialType,
};
