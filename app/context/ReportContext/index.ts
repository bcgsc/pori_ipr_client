import React from 'react';
import {
  ReportContextType, ReportType, PatientInformationType, SampleInfoType,
} from './types';

const ReportContext = React.createContext<ReportContextType>({
  canEdit: false,
  report: null,
  setReport: () => {},
});

export default ReportContext;

export type {
  ReportContextType,
  ReportType,
  PatientInformationType,
  SampleInfoType,
};
