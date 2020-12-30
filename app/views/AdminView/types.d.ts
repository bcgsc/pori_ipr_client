/* eslint-disable camelcase */
type recordDefaults = {
  ident: string,
  updatedAt: string | null,
  createdAt: string | null,
}

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
  users: userGroupMemberType,
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

type shortReportType = {
  alternateIdentifier: string | null,
  patientId: string,
} & recordDefaults;

type projectType = {
  name: string,
  reports: shortReportType[],
  users: userType[],
} & recordDefaults;

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

type formErrorType = {
  username: boolean,
  firstName: boolean,
  lastName: boolean,
  email: boolean,
};

export {
  userType,
  groupType,
  userProjectsType,
  shortReportType,
  projectType,
  formErrorType,
};
