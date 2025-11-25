import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import searchReportsColumns from '@/utils/searchReportsColumns';
import searchColumnDefs from '@/components/ReportsTable/searchColumnDefs';
import { useQuery } from 'react-query';
import { ReportType } from '@/context/ReportContext';

import '../ReportsView/index.scss';
import './index.scss';

type ReportsSearchViewProps = WithLoadingInjectedProps;

/**
 * Report table containing all searched reports
 */
const ReportsSearchView = ({
  isLoading,
  setIsLoading,
}: ReportsSearchViewProps): JSX.Element => {
  const { search } = useLocation();

  const searchParams = useMemo(() => {
    return decodeURIComponent(search);
  }, [decodeURIComponent, search]);

  const { data: reportsData, isFetching: isApiLoading } = useQuery(
    `/reports${searchParams}`,
    async ({ queryKey: [route] }) => await api.get(route).request(),
    {
      staleTime: Infinity,
      retry: 1,
      enabled: Boolean(searchParams),
      select: (response) => {
        const reports = response.reports.map((report: ReportType) => {
          const [analyst] = report.users
            .filter((u) => u.role === 'analyst' && !u.deletedAt)
            .map((u) => u.user);

          const [reviewer] = report.users
            .filter((u) => u.role === 'reviewer')
            .map((u) => u.user);

          const [bioinformatician] = report.users
            .filter((u) => u.role === 'bioinformatician')
            .map((u) => u.user);

          const cleanedReport = report;

          if (!cleanedReport.patientInformation) {
            cleanedReport.patientInformation = null;
          }

          return (
            searchReportsColumns(cleanedReport, analyst, reviewer, bioinformatician)
          );
        });
        setIsLoading(false);
        return reports;
      },
      onError: (err: any) => {
        snackbar.error(`API error: ${err.message}`)
      }
    },
  );

  if (isLoading) { return null; }

  return (
    <div className="reports-table">
      <DataTable
        rowData={reportsData}
        columnDefs={searchColumnDefs}
        titleText="Matched Reports"
        isFullLength
        isSearch
        isApiLoading={isApiLoading}
      />
    </div>
  );
};

export default withLoading(ReportsSearchView);
