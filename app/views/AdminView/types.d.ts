/* eslint-disable camelcase */
import { UserType, RecordDefaults } from '../../common';

type ShortReportType = {
  alternateIdentifier: string | null;
  patientId: string;
} & RecordDefaults;

type ProjectType = {
  name: string;
  description: string;
  reports: ShortReportType[];
  users: UserType[];
} & RecordDefaults;

type FormErrorType = {
  username: boolean;
  firstName: boolean;
  lastName: boolean;
  email: boolean;
};

type TemplateType = {
  name: string;
  description: string;
} & RecordDefaults;

export {
  ShortReportType,
  ProjectType,
  TemplateType,
  FormErrorType,
};
