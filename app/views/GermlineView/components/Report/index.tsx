import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LinearProgress } from '@material-ui/core';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import columnDefs from './columnDefs';

import './index.scss';

const GermlineReport = (): JSX.Element => {
  const { ident } = useParams();

  const [report, setReport] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ident) {
      const getData = async () => {
        const reportResp = await api.get(
          `/germline-small-mutation-reports/${ident}`,
          {},
        ).request();
        setReport(reportResp);
        setIsLoading(false);
      };
      getData();
    }
  }, [ident]);

  return (
    <div className="germline-report">
      {!isLoading && (
        <DataTable
          columnDefs={columnDefs}
          rowData={report.variants}
        />
      )}
      {isLoading && (
        <LinearProgress color="secondary" />
      )}
    </div>
  );
};

export default GermlineReport;
