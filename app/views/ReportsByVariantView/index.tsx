import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '@/services/api';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import reportsColumns from '@/utils/reportsColumns';
import '../ReportsView/index.scss';
import ReportsTableComponent from '@/components/ReportsTable';

type ReportsByVariantViewProps = WithLoadingInjectedProps;

const ReportsByVariantView = ({
  isLoading,
  setIsLoading,
}: ReportsByVariantViewProps): JSX.Element => {
  const { keyVariant } = useParams<{ keyVariant: string }>();
  const [rowData, setRowData] = useState();

  useEffect(() => {
    if (keyVariant) {
      const getData = async () => {
        try {
          const { reports } = await api.get(`/reports?keyVariant=${keyVariant.replace(/%2F/, "\.")}`).request();
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
          }));
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [keyVariant, setIsLoading]);

  if (isLoading) { return null; }

  return (
    <ReportsTableComponent rowData={rowData} />
  );
};

export default withLoading(ReportsByVariantView);
