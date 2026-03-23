import React from 'react';
import {
  ReportContextType, SampleInfoType,
} from './types';

const ReportContext = React.createContext<ReportContextType>({
  canEdit: false,
  report: null,
  reportTemplateName: '',
  refetchReport: () => null,
});

export default ReportContext;

export type {
  ReportContextType,
  SampleInfoType,
};
