/* eslint-disable camelcase */
type userGroupMemberType = {
  createdAt: string,
  deletedAt: null | string,
  group_id: number,
  id: number,
  updatedAt: null | string,
  user_id: number,
};

type groupType = {
  ident: string,
  name: string,
  userGroupMember: userGroupMemberType,
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
  createdAt: string,
  email: string,
  firstName: string,
  groups: groupType[],
  ident: string,
  lastLogin: null | string,
  lastName: string,
  projects: userProjectsType[],
  type: string,
  updatedAt: null | string,
  username: string,
};

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
  formErrorType,
};
