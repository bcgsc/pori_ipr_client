import React, { useEffect, useState } from 'react';

import ApiPaginatedTable from './components/ApiPaginatedTable';
import api from '../../../../services/api';
import columnDefs from './columnDefs';
import ParamsContext from './components/ParamsContext';

const Board = (): JSX.Element => {
  const [reports, setReports] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);


  useEffect(() => {
    const getData = async () => {
      const {
        total: totalRowsResp,
        reports: reportsResp,
      } = await api.get(`/germline-small-mutation-reports?limit=${limit}&offset=${offset}`, {}).request();
      setReports(reportsResp);
      setTotalRows(totalRowsResp);
    };
    getData();
  }, [limit, offset]);

  return (
    <ParamsContext.Provider
      value={{
        limit, setLimit, offset, setOffset
      }}
    >
      {Boolean(reports.length) && (
        <ApiPaginatedTable
          rowData={reports}
          columnDefs={columnDefs}
          totalRows={totalRows}
        />
      )}
    </ParamsContext.Provider>
  );
};

export default Board;
