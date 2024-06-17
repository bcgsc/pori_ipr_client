import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '@/services/api';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import startCase from '@/utils/startCase';
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

            return {
              patientID: report.patientId,
              analysisBiopsy: report.biopsyName,
              reportType: report.template.name === 'probe' ? 'Targeted Gene' : startCase(report.template.name),
              state: report.state,
              caseType: report?.patientInformation?.caseType,
              project: report.projects.map((project) => project.name).sort().join(', '),
              physician: report?.patientInformation?.physician,
              analyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
              reportIdent: report.ident,
              tumourType: report?.patientInformation?.diagnosis,
              date: report.createdAt,
              reviewer: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : null,
              bioinformatician: bioinformatician ? `${bioinformatician.firstName} ${bioinformatician.lastName}` : null,
            };
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
