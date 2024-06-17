import React, {
  useState, useEffect,
} from 'react';
import ReportsTableComponent from '@/components/ReportsTable';

import reportsColumns from '@/utils/reportsColumns';
import useResource from '@/hooks/useResource';
import api from '@/services/api';
import { ReportType } from '@/context/ReportContext';
import useSecurity from '@/hooks/useSecurity';

import './index.scss';

const MyReportsView = (): JSX.Element => {
  const {
    adminAccess, unreviewedAccess, nonproductionAccess, allStates, unreviewedStates, nonproductionStates,
  } = useResource();
  const { userDetails } = useSecurity();
  const [rowData, setRowData] = useState<ReportType[]>();

  useEffect(() => {
    if (!rowData) {
      const getData = async () => {
        let statesArray = allStates;

        if (!nonproductionAccess) {
          statesArray = statesArray.filter((elem) => !nonproductionStates.includes(elem));
        }

        if (!unreviewedAccess) {
          statesArray = statesArray.filter((elem) => !unreviewedStates.includes(elem));
        }
        const states = statesArray.join(',');

        const { reports } = await api.get(`/reports${states ? `?states=${states}` : ''}`, {}).request();

        const myReports = [];

        reports.map((report: ReportType) => {
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
      };
      getData();
    }
  }, [adminAccess, allStates, nonproductionStates, unreviewedStates, nonproductionAccess, unreviewedAccess, rowData, userDetails.ident]);

  return (
    <ReportsTableComponent rowData={rowData} />
  );
};

export default MyReportsView;
