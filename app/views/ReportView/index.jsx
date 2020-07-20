import React, {
  lazy,
  useEffect,
  useState,
} from 'react';
import {
  Switch, Route, useRouteMatch, useParams,
} from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';

import SecurityContext from '@/components/SecurityContext';
import ReportToolbar from '@/components/ReportToolbar';
import ReportSidebar from '@/components/ReportSidebar';
import ReportService from '@/services/reports/report.service';
import { genomic, probe } from './sections';

import './index.scss';

const GenomicSummary = lazy(() => import('./components/GenomicSummary'));
const AnalystComments = lazy(() => import('./components/AnalystComments'));
const PathwayAnalysis = lazy(() => import('./components/PathwayAnalysis'));
const TherapeuticTargets = lazy(() => import('./components/TherapeuticTargets'));
const KbMatches = lazy(() => import('./components/KbMatches'));
const Slides = lazy(() => import('./components/Slides'));
const Discussion = lazy(() => import('./components/Discussion'));
const Microbial = lazy(() => import('./components/Microbial'));
const Spearman = lazy(() => import('./components/Spearman'));
const DiseaseSpecific = lazy(() => import('./components/DiseaseSpecific'));
const SmallMutations = lazy(() => import('./components/SmallMutations'));
const CopyNumber = lazy(() => import('./components/CopyNumber'));
const StructuralVariants = lazy(() => import('./components/StructuralVariants'));
const Expression = lazy(() => import('./components/Expression'));
const Appendices = lazy(() => import('./components/Appendices'));
const Settings = lazy(() => import('./components/Settings'));

const ReportView = () => {
  const match = useRouteMatch();
  const params = useParams();
  const theme = useTheme();
  const [report, setReport] = useState();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [sections, setSections] = useState();

  useEffect(() => {
    if (!report) {
      const getReport = async () => {
        const resp = await ReportService.getReport(params.ident);
        setReport(resp);

        if (resp.type === 'genomic') {
          setSections(genomic);
        } else {
          setSections(probe);
        }
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
            onSidebarToggle={setIsSidebarVisible}
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
            <Route
              render={routeProps => (
                <TherapeuticTargets {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/therapeutic-targets`}
            />
            <Route
              render={routeProps => (
                <KbMatches {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/kb-matches`}
            />
            <Route
              render={routeProps => (
                <Discussion {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/discussion`}
            />
            <Route
              render={routeProps => (
                <Microbial {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/microbial`}
            />
            <Route
              render={routeProps => (
                <Spearman {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/spearman`}
            />
            <Route
              render={routeProps => (
                <DiseaseSpecific {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/disease-specific`}
            />
            <Route
              render={routeProps => (
                <SmallMutations {...routeProps} print={false} report={report} reportEdit theme={theme} />
              )}
              path={`${match.path}/small-mutations`}
            />
            <Route
              render={routeProps => (
                <CopyNumber {...routeProps} print={false} report={report} reportEdit theme={theme} />
              )}
              path={`${match.path}/copy-number`}
            />
            <Route
              render={routeProps => (
                <StructuralVariants {...routeProps} print={false} report={report} reportEdit theme={theme} />
              )}
              path={`${match.path}/structural-variants`}
            />
            <Route
              render={routeProps => (
                <Expression {...routeProps} print={false} report={report} reportEdit />
              )}
              path={`${match.path}/expression`}
            />
            <Route
              render={routeProps => (
                <Appendices {...routeProps} print={false} report={report} reportEdit theme={theme} />
              )}
              path={`${match.path}/appendices`}
            />
            <Route
              render={routeProps => (
                <Settings {...routeProps} print={false} report={report} reportEdit showBindings />
              )}
              path={`${match.path}/settings`}
            />
            {/* Need token for FileUpload API call */}
            <SecurityContext.Consumer>
              {value => (
                <>
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
                  <Route
                    render={routeProps => (
                      <Slides
                        {...routeProps}
                        print={false}
                        report={report}
                        reportEdit
                        token={value.authorizationToken}
                      />
                    )}
                    path={`${match.path}/slides`}
                  />
                </>
              )}
            </SecurityContext.Consumer>
          </Switch>
        </div>
      </div>
      {Boolean(sections) && (
        <ReportSidebar sections={sections} isSidebarVisible={isSidebarVisible} />
      )}
    </div>
  );
};

export default ReportView;
