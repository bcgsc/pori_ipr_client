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

type AnyVariantType = 'cnv' | 'mut' | 'sv' | 'exp' | 'msi' | 'tmb';

type VariantTypeMap<T> =
  T extends 'cnv' ? CopyNumberType :
    T extends 'mut' ? SmallMutationType :
      T extends 'sv' ? StructuralVariantType:
        T extends 'exp' ? ExpOutliersType :
          T extends 'msi' ? MsiType :
            T extends 'tmb' ? TmburType:
              never;

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

type KbMatchType<T extends AnyVariantType = AnyVariantType> = {
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
  variantType: T;
  variant: VariantTypeMap<T>;
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
  comments: string | null;
  copyChange: number | null;
  end: number | null;
  gene: GeneType | null;
  kbCategory: string | null;
  log2Cna: string | null;
  lohState: string | null;
  size: number | null;
  start: number | null;
} & RecordDefaults;

type StructuralVariantType = {
  breakpoint: string | null;
  comments: string | null;
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
  comments: string | null;
  endPosition: number | null;
  gene: GeneType;
  germline: string | null;
  hgvsCds: string | null;
  hgvsGenomic: string | null;
  hgvsProtein: string | null;
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

type TmburType = {
  cdsBasesIn1To22AndXAndY: string;
  cdsIndels: number;
  cdsIndelTmb: number;
  cdsSnvs: number,
  cdsSnvTmb: number;
  comments: string;
  genomeSnvTmb: number;
  genomeIndelTmb: number;
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
} & RecordDefaults;

type MicrobialType = {
  integrationSite: string | null;
  species: string | null;
} & RecordDefaults;

type AppendixType = RecordDefaults & {
  text: string;
};

export {
  RecordDefaults,
  UserType,
  TemplateType,
  AppendixType,
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
