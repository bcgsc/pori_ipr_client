import React, { useEffect, useState } from 'react';

import ApiPaginatedTable from '../../../../components/ApiPaginatedTable';
import api from '../../../../services/api';
import columnDefs from './columnDefs';

const Board = (): JSX.Element => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const { reports: reportsResp } = await api.get('/germline-small-mutation-reports', {}).request();
      setReports(reportsResp);
    };
    getData();
  }, []);

  const handleOffsetChange = async (offset) => {
    const { reports: reportsResp } = await api.get(`/germline-small-mutation-reports?offset=${offset}`, {}).request();
    setReports(reportsResp);
  };

  return (
    <>
      {Boolean(reports.length) && (
        <ApiPaginatedTable
          rowData={reports}
          columnDefs={columnDefs}
          onOffsetChange={handleOffsetChange}
        />
      )}
    </>
  );
};

export default Board;
