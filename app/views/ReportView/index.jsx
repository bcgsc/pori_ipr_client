import React, { lazy, useEffect, useState } from 'react';
import {
  Switch, Route, useRouteMatch, useParams,
} from 'react-router-dom';

import ReportToolbar from '@/components/ReportToolbar';
import ReportSidebar from '@/components/ReportSidebar';
import ReportService from '@/services/reports/report.service';
import sections from './sections';

import './index.scss';

const GenomicSummary = lazy(() => import('./components/GenomicSummary'));
const AnalystComments = lazy(() => import('./components/AnalystComments'));


const ReportView = () => {
  const match = useRouteMatch();
  const params = useParams();
  const [report, setReport] = useState();

  useEffect(() => {
    if (!report) {
      const getReport = async () => {
        const resp = await ReportService.getReport(params.ident);
        setReport(resp);
      };

      getReport();
    }
  }, [report]);

  return (
    <div className="report__container">
      <div className="report__content-container">
        {Boolean(report) && (
          <ReportToolbar
            diagnosis={report.patientInformation.diagnosis}
            patientId={report.patientId}
            type={report.type}
            state={report.state}
            isVisible
            toggleIsVisible={() => {}}
          />
        )}
        <div className="report__content">
          <Switch>
            <Route
              render={routeProps => (
                <GenomicSummary {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/summary`}
            />
            <Route
              render={routeProps => (
                <AnalystComments {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/analyst-comments`}
            />
          </Switch>
        </div>
      </div>
      <ReportSidebar sections={sections} ident={params.ident} />
    </div>
  );
};

export default ReportView;
