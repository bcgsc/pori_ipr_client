import React, {
  useState, useEffect, useMemo,
} from 'react';
import ReportsTableComponent from '@/components/ReportsTable';

import reportsColumns from '@/utils/reportsColumns';
import useResource from '@/hooks/useResource';
import { ReportsType, ReportType } from '@/common';
import { useReportsAll } from '@/queries/get';
import useSecurity from '@/hooks/useSecurity';
import { CircularProgress } from '@mui/material';

import './index.scss';

const MyReportsView = (): JSX.Element => {
  const {
    adminAccess, unreviewedAccess, nonproductionAccess, allStates, unreviewedStates, nonproductionStates,
  } = useResource();
  const { userDetails } = useSecurity();
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

  const { isLoading: isApiLoading, data: reportsData } = useReportsAll<ReportsType>({
    staleTime: Infinity,
    cacheTime: Infinity,
  }, {
    states,
  });

  useEffect(() => {
    if (!rowData) {
      const getData = async () => {
        if (!isApiLoading) {
          const myReports = [];
          reportsData.reports.map((report: ReportType) => {
            const [analyst] = report.users
              .filter((u) => u.role === 'analyst')
              .map((u) => u.user);

            const [reviewer] = report.users
              .filter((u) => u.role === 'reviewer')
              .map((u) => u.user);

            const [bioinformatician] = report.users
              .filter((u) => u.role === 'bioinformatician')
              .map((u) => u.user);

            const creator = report.createdBy;

            const allUserIdents = report.users.filter((u) => u.role === 'analyst' || 'reviewer' || 'bioinformatician').map((u) => u.user.ident);

            allUserIdents.push(creator.ident);

            if (allUserIdents.includes(userDetails.ident)) {
              myReports.push(reportsColumns(report, analyst, reviewer, bioinformatician));
            }
            return null;
          });
          setRowData(myReports);
        }
      };
      getData();
    }
  }, [adminAccess, allStates, nonproductionStates, unreviewedStates, nonproductionAccess, unreviewedAccess, rowData, userDetails, isApiLoading, reportsData]);

  return (
    <>
      {isApiLoading && 
        <div className="circular-progress">
          <CircularProgress />
        </div>
      }
      {rowData && <ReportsTableComponent rowData={rowData} />}
    </>
  );
};

export default MyReportsView;
