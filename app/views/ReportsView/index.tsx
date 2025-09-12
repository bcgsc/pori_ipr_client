import React, {
  useState, useEffect,
} from 'react';
import ReportsTableComponent from '@/components/ReportsTable';

import reportsColumns from '@/utils/reportsColumns';
import useResource from '@/hooks/useResource';
import api from '@/services/api';
import { ReportType } from '@/context/ReportContext';
import { useQuery } from 'react-query';

const useReports = (states) => useQuery({
  queryKey: ['reports'],
  queryFn: async () => {
    const resp = await api.get(`/reports${states ? `?states=${states}` : ''}`, {}).request();
    return resp;
  },
});

/**
 * Report table containing all reports
 */
const ReportsView = (): JSX.Element => {
  const {
    adminAccess, unreviewedAccess, nonproductionAccess, allStates, unreviewedStates, nonproductionStates,
  } = useResource();
  const [rowData, setRowData] = useState<ReportType[]>();

  let statesArray = allStates;
  if (!nonproductionAccess) {
    statesArray = statesArray.filter((elem) => !nonproductionStates.includes(elem));
  }
  if (!unreviewedAccess) {
    statesArray = statesArray.filter((elem) => !unreviewedStates.includes(elem));
  }
  const states = statesArray.join(',');
  const reportsQuery = useReports(states);

  useEffect(() => {
    if (!rowData) {
      const getData = async () => {
        const isApiLoading = reportsQuery.isLoading;
        if (!isApiLoading) {
          const { reports } = reportsQuery.data;
          setRowData(reports.map((report: ReportType) => {
            const [analyst] = report.users
              .filter((u) => u.role === 'analyst')
              .map((u) => u.user);

            const [reviewer] = report.users
              .filter((u) => u.role === 'reviewer')
              .map((u) => u.user);

            const [bioinformatician] = report.users
              .filter((u) => u.role === 'bioinformatician')
              .map((u) => u.user);

            return (
              reportsColumns(report, analyst, reviewer, bioinformatician)
            );
          }));
        }
      };
      getData();
    }
  }, [adminAccess, allStates, nonproductionStates, unreviewedStates, nonproductionAccess, unreviewedAccess, rowData, reportsQuery]);

  return (
    <ReportsTableComponent rowData={rowData} />
  );
};

export default ReportsView;
