/* eslint-disable camelcase */
import { userType, recordDefaults } from '../../common';

type shortReportType = {
  alternateIdentifier: string | null;
  patientId: string;
} & recordDefaults;

type projectType = {
  name: string;
  reports: shortReportType[];
  users: userType[];
} & recordDefaults;

type formErrorType = {
  username: boolean;
  firstName: boolean;
  lastName: boolean;
  email: boolean;
};

export {
  shortReportType,
  projectType,
  formErrorType,
};
