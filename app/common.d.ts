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
    };
  }
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
  ident: string;
  category: string;
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

type SmallMutationType = {
  altSeq: string | null;
  chromosome: number | null;
  endPosition: number | null;
  gene: Record<string, unknown>;
  germline: string | null;
  hgvsCds: string | null;
  hgvsProtein: string | null;
  kbMatches: KbMatchType[];
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

export {
  RecordDefaults,
  UserType,
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
};
