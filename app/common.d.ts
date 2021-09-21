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

export {
  RecordDefaults,
  UserType,
  GroupType,
  UserProjectsType,
  UserGroupMemberType,
  ImageType,
  GeneType,
  KbMatchType,
};
