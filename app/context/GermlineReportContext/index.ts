import React from 'react';
import {
  GermlineReportContextType, GermlineReportType, VariantType,
} from './types';

const GermlineReportContext = React.createContext<GermlineReportContextType>({
  report: null,
  setReport: () => {},
});

export default GermlineReportContext;

export type {
  GermlineReportType,
  VariantType,
};
