import React from 'react';
import { ReportContextType } from './types';

const ReportContext = React.createContext<ReportContextType>({
  report: null,
  setReport: () => {},
});

export default ReportContext;
