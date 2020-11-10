/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { ReportContextInterface } from './interfaces';

const ReportContext = React.createContext<ReportContextInterface>({
  report: null,
  setReport: () => {},
});

export default ReportContext;
