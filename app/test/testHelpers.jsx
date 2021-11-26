import React from 'react';

import ReportContext from '@/context/ReportContext';

const withReportContext = (Component, mockReport) => (function ReportContextHOC(props) {
  return (
    <ReportContext.Provider value={{ report: mockReport, setReport: () => {} }}>
      <Component {...props} />
    </ReportContext.Provider>
  );
});

export {
  withReportContext,
};
