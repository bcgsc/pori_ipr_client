import React from 'react';
import {
  ReportContextType, ReportType, PatientInformationType, SampleInfoType,
} from './types';

const ReportContext = React.createContext<ReportContextType>({
  report: null,
  setReport: () => {},
});

export default ReportContext;

export {
  ReportType,
  PatientInformationType,
  SampleInfoType,
};
