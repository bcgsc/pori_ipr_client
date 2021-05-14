import React, { useEffect, useState, useContext } from 'react';

import api from '@/services/api';
import ReportContext from '@/components/ReportContext';

const MinimalSummary = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        await api.get().request();
      };
      getData();
    }
  }, [report]);

  return (
    <div>
      test
    </div>
  );
};

export default MinimalSummary;
