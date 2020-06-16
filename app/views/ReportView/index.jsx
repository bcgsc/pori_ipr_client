import React, {
  lazy,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  Switch, Route, useRouteMatch, useParams,
} from 'react-router-dom';

import SecurityContext from '@/components/SecurityContext';
import ReportToolbar from '@/components/ReportToolbar';
import ReportSidebar from '@/components/ReportSidebar';
import ReportService from '@/services/reports/report.service';
import sections from './sections';

import './index.scss';

const GenomicSummary = lazy(() => import('./components/GenomicSummary'));
const AnalystComments = lazy(() => import('./components/AnalystComments'));
const PathwayAnalysis = lazy(() => import('./components/PathwayAnalysis'));


const ReportView = () => {
  const match = useRouteMatch();
  const params = useParams();
  const [report, setReport] = useState();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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
            isSidebarVisible={isSidebarVisible}
            setIsSidebarVisible={setIsSidebarVisible}
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
            <SecurityContext.Consumer>
              {value => (
                <Route
                  render={routeProps => (
                    <PathwayAnalysis
                      {...routeProps}
                      print={false}
                      report={report}
                      reportEdit
                      token={value.authorizationToken}
                    />
                  )}
                  path={`${match.path}/pathway-analysis`}
                />
              )}
            </SecurityContext.Consumer>
          </Switch>
        </div>
      </div>
      <ReportSidebar sections={sections} isSidebarVisible={isSidebarVisible} />
    </div>
  );
};

export default ReportView;
