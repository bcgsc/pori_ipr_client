/* eslint-disable camelcase */
import { ProjectType, ShortReportType } from '../../common';

type FormErrorType = {
  username: boolean;
  firstName: boolean;
  lastName: boolean;
  email: boolean;
};

export {
  ShortReportType,
  ProjectType,
  FormErrorType,
};
