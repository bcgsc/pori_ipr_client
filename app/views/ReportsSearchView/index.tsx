import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import searchReportsColumns from '@/utils/searchReportsColumns';
import searchColumnDefs from '@/components/ReportsTable/searchColumnDefs';

import '../ReportsView/index.scss';
import './index.scss';

type ReportsSearchViewProps = WithLoadingInjectedProps;

const ReportsSearchView = ({
  isLoading,
  setIsLoading,
}: ReportsSearchViewProps): JSX.Element => {
  const { search } = useLocation();
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const { reports } = await api.get(`/reports${search}`).request();

        setRowData(reports.map((report) => {
          const [analyst] = report.users
            .filter((u) => u.role === 'analyst' && !u.deletedAt)
            .map((u) => u.user);

          const [reviewer] = report.users
            .filter((u) => u.role === 'reviewer')
            .map((u) => u.user);

          const [bioinformatician] = report.users
            .filter((u) => u.role === 'bioinformatician')
            .map((u) => u.user);

          const reportData = report;

          if (!report.patientInformation) {
            reportData.patientInformation = {};
          }

          return (
            searchReportsColumns(reportData, analyst, reviewer, bioinformatician)
          );
        }));
      } catch (err) {
        snackbar.error(`Network error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [search, setIsLoading]);

  if (isLoading) { return null; }

  return (
    <div className="reports-table">
      <DataTable
        rowData={rowData}
        columnDefs={searchColumnDefs}
        titleText="Matched Reports"
        isFullLength
        isSearch
      />
    </div>
  );
};

export default withLoading(ReportsSearchView);
