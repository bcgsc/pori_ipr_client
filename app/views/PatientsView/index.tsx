import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '@/services/api';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import reportsColumns from '@/utils/reportsColumns';
import '../ReportsView/index.scss';
import ReportsTableComponent from '@/components/ReportsTable';
import { ReportType } from '@/context/ReportContext';

type PatientsViewProps = WithLoadingInjectedProps;

const PatientsView = ({
  isLoading,
  setIsLoading,
}: PatientsViewProps): JSX.Element => {
  const { patientId } = useParams<{ patientId: ReportType['patientId'] }>();
  const [rowData, setRowData] = useState();

  useEffect(() => {
    if (patientId) {
      const getData = async () => {
        try {
          const { reports } = await api.get(`/reports?searchText=${patientId}`).request();
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

            if (!report.patientInformation) {
              report.patientInformation = {};
            }

            return (
              reportsColumns(report, analyst, reviewer, bioinformatician)
            );
          }).filter((report) => (
            report.patientID === patientId || report.alternateIdentifier === patientId
          )));
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [patientId, setIsLoading]);

  if (isLoading) { return null; }

  return (
    <ReportsTableComponent rowData={rowData} />
  );
};

export default withLoading(PatientsView);
