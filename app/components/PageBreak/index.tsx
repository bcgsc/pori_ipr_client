import React, { useContext } from 'react';

import ReportContext from '@/context/ReportContext';

import './index.scss';

const PageBreak = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  return (
    <>
      {report && (
        <span className="page-break" />
      )}
    </>
  );
};

export default PageBreak;
