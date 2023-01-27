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
  cancerRelated: boolean;
  drugTargetable: boolean;
  knownFusionPartner: boolean;
  knownSmallMutation: boolean;
  name: string;
  oncogene: boolean;
  therapeuticAssociated: boolean;
  tumourSuppressor: boolean;
};

type KbMatchType = {
  category: string;
  approvedTherapy: boolean;
  kbVariant: string;
  disease: string;
  relevance: string;
  context: string;
  status: string;
  reference: string;
  sample: string;
  inferred: boolean;
  evidenceLevel: string;
  iprEvidenceLevel: string;
  matchedCancer: boolean;
  pmidRef: string;
  variantType: 'cnv' | 'mut' | 'sv';
  kbVariantId: string;
  kbStatementId: string;
  kbData: {
    inferred: boolean;
  }
  externalSource: string;
  externalStatementId: string;
  reviewStatus: string;
} & RecordDefaults;

type CopyNumberType = {
  chromosomeBand: string | null;
  cna: string | null;
  cnvState: string | null;
  copyChange: number | null;
  end: number | null;
  gene: GeneType | null;
  kbCategory: string | null;
  kbMatches: null | KbMatchType[];
  log2Cna: string | null;
  lohState: string | null;
  size: number | null;
  start: number | null;
} & RecordDefaults;

type StructuralVariantType = {
  breakpoint: string | null;
  conventionalName: string | null;
  ctermGene: string | null;
  ctermTranscript: string | null;
  detectedIn: string | null;
  eventType: string | null;
  exon1: string | null;
  exon2: string | null;
  frame: string | null;
  gene1: GeneType | null;
  gene2: GeneType | null;
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

type SmallMutationType = {
  altSeq: string | null;
  chromosome: number | null;
  endPosition: number | null;
  gene: GeneType;
  germline: string | null;
  hgvsCds: string | null;
  hgvsGenomic: string | null;
  hgvsProtein: string | null;
  kbMatches: KbMatchType[];
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
  startPosition: number | null;
  transcript: string | null;
  tumourAltCopies: number | null;
  tumourAltCount: number | null;
  tumourDepth: number | null;
  tumourRefCopies: number | null;
  tumourRefCount: number | null;
  zygosity: string | null;
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
  kbMatches: KbMatchType[];
  location: number | null;
  primarySiteFoldChange: number | null;
  primarySitePercentile: number | null;
  primarySiteQC: number | null;
  primarySiteZScore: number | null;
  primarySitekIQR: number | null;
  rnaReads: number | null;
  rpkm: number | null;
  tpm: number | null;
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

type AppendixType = RecordDefaults & {
  text: string;
};

export {
  RecordDefaults,
  UserType,
  TemplateType,
  AppendixType,
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
};
