import React, {
  useState, useEffect, useMemo,
} from 'react';
import ReportsTableComponent from '@/components/ReportsTable';

import reportsColumns from '@/utils/reportsColumns';
import useResource from '@/hooks/useResource';
import { ReportsType, ReportType } from '@/common';
import { CircularProgress } from '@mui/material';
import { useReportsAll } from '@/queries/get';

import './index.scss';

/**
 * Report table containing all reports
 */
const ReportsView = (): JSX.Element => {
  const {
    adminAccess, unreviewedAccess, nonproductionAccess, allStates, unreviewedStates, nonproductionStates,
  } = useResource();
  const [rowData, setRowData] = useState<ReportType[]>();

  const states = useMemo(() => {
    let statesArray = allStates;
    if (!nonproductionAccess) {
      statesArray = statesArray.filter((elem) => !nonproductionStates.includes(elem));
    }
    if (!unreviewedAccess) {
      statesArray = statesArray.filter((elem) => !unreviewedStates.includes(elem));
    }
    return statesArray.join(',');
  }, [allStates, nonproductionAccess, unreviewedAccess, nonproductionStates, unreviewedStates]);

  const { isLoading: isApiLoading, data: reportsData } = useReportsAll<ReportsType>({}, {
    states,
  });

  useEffect(() => {
    if (!rowData) {
      const getData = async () => {
        if (!isApiLoading) {
          setRowData(reportsData.reports.map((report: ReportType) => {
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
  }, [adminAccess, allStates, nonproductionStates, unreviewedStates, nonproductionAccess, unreviewedAccess, rowData, isApiLoading, reportsData]);

  return (
    <>
      {isApiLoading
        && (
        <div className="circular-progress">
          <CircularProgress />
        </div>
        )}
      {rowData && <ReportsTableComponent rowData={rowData} />}
    </>
  );
};

export default ReportsView;
