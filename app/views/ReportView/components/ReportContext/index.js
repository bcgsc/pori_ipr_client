import React from 'react';

const ReportContext = React.createContext({
  report: null,
  setReport: () => {},
});

export default ReportContext;
