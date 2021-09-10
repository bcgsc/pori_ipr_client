import React, { useEffect, useState } from 'react';

import { GermlineReportType } from '@/context/GermlineReportContext/types';
import api from '@/services/api';
import { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import ApiPaginatedTable from './components/ApiPaginatedTable';
import columnDefs from './columnDefs';
import ParamsContext from './components/ParamsContext';

type BoardProps = WithLoadingInjectedProps;

const Board = ({
  isLoading,
  setIsLoading,
}: BoardProps): JSX.Element => {
  const [reports, setReports] = useState<GermlineReportType[]>();
  const [totalRows, setTotalRows] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);
  const [reviewFilter, setReviewFilter] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const getData = async () => {
      try {
        const {
          total: totalRowsResp,
          reports: reportsResp,
        } = await api.get(
          `/germline-small-mutation-reports?limit=${limit}&offset=${offset}${reviewFilter ? '&reviewType=biofx&exported=false' : ''}${searchText ? `&patientId=${searchText}` : ''}`,
        ).request();
        setReports(reportsResp);
        setTotalRows(totalRowsResp);
      } catch (err) {
        snackbar.error(`Network error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [limit, offset, reviewFilter, searchText, setIsLoading]);

  return (
    <ParamsContext.Provider
      value={{
        limit, setLimit, offset, setOffset, reviewFilter, setReviewFilter, searchText, setSearchText,
      }}
    >
      {!isLoading && (
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
