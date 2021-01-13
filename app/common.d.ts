/* eslint-disable camelcase */
declare module '*.scss';

declare let CONFIG: {
  ATTRS: {
    NAME: string,
  },
  STORAGE: {
    REFERRER: string,
    KEYCLOAK: string,
  },
  ENDPOINTS: {
    API: string,
    KEYCLOAK: string,
    GRAPHKB: string,
  },
  SSO: {
    REALM: string,
    CLIENT: string,
  },
};

type recordDefaults = {
  ident: string,
  updatedAt: string | null,
  createdAt: string | null,
};

type userGroupMemberType = {
  createdAt: string,
  deletedAt: null | string,
  group_id: number,
  id: number,
  updatedAt: null | string,
  user_id: number,
} & recordDefaults;

type groupType = {
  ident: string,
  name: string,
  users: userGroupMemberType[],
  owner: userType,
};

type userProjectsType = {
  ident: string,
  name: string,
  user_project: {
    createdAt: string,
    deletedAt: null | string,
    id: number,
    project_id: number,
    updatedAt: null | string,
    user_id: number,
  },
};

type userType = {
  email: string,
  firstName: string,
  groups: groupType[],
  lastLogin: null | string,
  lastName: string,
  projects: userProjectsType[],
  type: string,
  username: string,
} & recordDefaults;

export {
  recordDefaults,
  userType,
  groupType,
  userProjectsType,
  userGroupMemberType,
};
