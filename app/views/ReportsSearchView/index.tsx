import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import searchReportsColumns from '@/utils/searchReportsColumns';
import searchColumnDefs from '@/components/ReportsTable/searchColumnDefs';
import { useQuery } from 'react-query';
import { ReportType } from '@/context/ReportContext';
import useSearchParams from '@/hooks/useSearchParams';
import { SearchParamsType } from '@/context/SearchParamsContext';
import { CircularProgress } from '@mui/material';

import '../ReportsView/index.scss';
import './index.scss';

/**
 * Report table containing all searched reports
 */
const ReportsSearchView = (): JSX.Element => {
  const { search } = useLocation();
  const { searchParams, setSearchParams } = useSearchParams();

  const searchParamsUrl = useMemo(() => {
    return decodeURIComponent(search);
  }, [decodeURIComponent, search]);

  const parseSearchParamsFromUrl = (searchParamsUrl: string) => {
    const params: SearchParamsType[] = [];
    const regex = /\[([^|]+)\|([^|]+)\|([^]+?)\]/g;
    let match = [];
  
    while ((match = regex.exec(searchParamsUrl)) !== null) {
      params.push({
        category: match[1],
        keyword: match[2],
        threshold: match[3],
      });
    }
  
    return params;
  }

  const { data: reportsData, isFetching: isApiLoading } = useQuery(
    `/reports${searchParamsUrl}`,
    async ({ queryKey: [route] }) => await api.get(route).request(),
    {
      staleTime: 0,
      enabled: Boolean(searchParamsUrl),
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
        return reports;
      },
      onSettled: () => {
        // setIsLoading(false);

        // Re-populating context using url without having to store search params in local storage
        if (!searchParams || !searchParams.length) {
          setSearchParams(parseSearchParamsFromUrl(searchParamsUrl));
        }
      },
      onError: (err: any) => {
        snackbar.error(`API error: ${err.message}`)
      }
    },
  );

  if (isApiLoading) {
    return <div className='centered'><CircularProgress /></div>
  }

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

export default ReportsSearchView;
