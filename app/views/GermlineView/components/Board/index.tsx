import React, { useEffect, useState } from 'react';

import ApiPaginatedTable from './components/ApiPaginatedTable';
import api from '../../../../services/api';
import columnDefs from './columnDefs';
import ParamsContext from './components/ParamsContext';
import { GermlineReportType } from '../../types';

const Board = (): JSX.Element => {
  const [reports, setReports] = useState<GermlineReportType[]>();
  const [totalRows, setTotalRows] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);
  const [reviewFilter, setReviewFilter] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const getData = async () => {
      const {
        total: totalRowsResp,
        reports: reportsResp,
      } = await api.get(
        `/germline-small-mutation-reports?limit=${limit}&offset=${offset}${reviewFilter ? '&reviewType=biofx&exported=false' : ''}${searchText ? `&patientId=${searchText}` : ''}`,
        {},
      ).request();
      setReports(reportsResp);
      setTotalRows(totalRowsResp);
    };
    getData();
  }, [limit, offset, reviewFilter, searchText]);

  return (
    <ParamsContext.Provider
      value={{
        limit, setLimit, offset, setOffset, reviewFilter, setReviewFilter, searchText, setSearchText,
      }}
    >
      {reports && (
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
