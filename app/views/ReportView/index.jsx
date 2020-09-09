import React, {
  lazy,
  useEffect,
  useState,
  useContext,
} from 'react';
import {
  Switch, Route, useRouteMatch, useParams,
} from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';

import SecurityContext from '@/components/SecurityContext';
import ReportToolbar from '@/components/ReportToolbar';
import ReportSidebar from '@/components/ReportSidebar';
import ReportService from '@/services/reports/report.service';
import EditContext from '@/components/EditContext';
import ReportContext from '../../components/ReportContext';
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
const MutationSignatures = lazy(() => import('./components/MutationSignatures'));
const MutationBurden = lazy(() => import('./components/MutationBurden'));
const ExpressionCorrelation = lazy(() => import('./components/ExpressionCorrelation'));
const SmallMutations = lazy(() => import('./components/SmallMutations'));
const CopyNumber = lazy(() => import('./components/CopyNumber'));
const StructuralVariants = lazy(() => import('./components/StructuralVariants'));
const Expression = lazy(() => import('./components/Expression'));
const Appendices = lazy(() => import('./components/Appendices'));
const Settings = lazy(() => import('./components/Settings'));
const ProbeSummary = lazy(() => import('./components/ProbeSummary/index.tsx'));

const ReportView = () => {
  const { path } = useRouteMatch();
  const params = useParams();
  const theme = useTheme();
  const { canEdit } = useContext(EditContext);
  const [report, setReport] = useState();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [sections, setSections] = useState();
  const [isProbe, setIsProbe] = useState(false);

  useEffect(() => {
    if (!report) {
      const getReport = async () => {
        const resp = await ReportService.getReport(params.ident);
        setReport(resp);

        if (resp.type === 'genomic') {
          setSections(genomic);
        } else {
          setSections(probe);
          setIsProbe(true);
        }
      };

      getReport();
    }
  }, [report]);

  return (
    <ReportContext.Provider value={{ report, setReport }}>
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
                  <>
                    {isProbe ? (
                      <ProbeSummary {...routeProps} print={false} report={report} canEdit={canEdit} />
                    ) : (
                      <GenomicSummary {...routeProps} print={false} />
                    )}
                  </>
                )}
                path={`${path}/summary`}
              />
              <Route
                render={routeProps => (
                  <AnalystComments {...routeProps} print={false} report={report} canEdit={canEdit} />
                )}
                path={`${path}/analyst-comments`}
              />
              <Route
                render={routeProps => (
                  <TherapeuticTargets {...routeProps} print={false} />
                )}
                path={`${path}/therapeutic-targets`}
              />
              <Route
                render={routeProps => (
                  <KbMatches {...routeProps} print={false} />
                )}
                path={`${path}/kb-matches`}
              />
              <Route
                render={routeProps => (
                  <Discussion {...routeProps} print={false} report={report} canEdit={canEdit} />
                )}
                path={`${path}/discussion`}
              />
              <Route
                render={routeProps => (
                  <Microbial {...routeProps} print={false} report={report} canEdit={canEdit} />
                )}
                path={`${path}/microbial`}
              />
              <Route
                render={routeProps => (
                  <MutationSignatures {...routeProps} print={false} />
                )}
                path={`${path}/mutation-signatures`}
              />
              <Route
                render={routeProps => (
                  <MutationBurden {...routeProps} print={false} />
                )}
                path={`${path}/mutation-burden`}
              />
              <Route
                render={routeProps => (
                  <ExpressionCorrelation {...routeProps} print={false} />
                )}
                path={`${path}/expression-correlation`}
              />
              <Route
                render={routeProps => (
                  <SmallMutations {...routeProps} print={false} theme={theme} report={report} canEdit={canEdit} />
                )}
                path={`${path}/small-mutations`}
              />
              <Route
                render={routeProps => (
                  <CopyNumber {...routeProps} print={false} theme={theme} report={report} canEdit={canEdit} />
                )}
                path={`${path}/copy-number`}
              />
              <Route
                render={routeProps => (
                  <StructuralVariants {...routeProps} print={false} theme={theme} report={report} canEdit={canEdit} />
                )}
                path={`${path}/structural-variants`}
              />
              <Route
                render={routeProps => (
                  <Expression {...routeProps} print={false} />
                )}
                path={`${path}/expression`}
              />
              <Route
                render={routeProps => (
                  <Appendices {...routeProps} print={false} theme={theme} isProbe={isProbe} report={report} canEdit={canEdit} />
                )}
                path={`${path}/appendices`}
              />
              <Route
                render={routeProps => (
                  <Settings {...routeProps} print={false} showBindings={!isProbe} report={report} canEdit={canEdit} />
                )}
                path={`${path}/settings`}
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
                          token={value.authorizationToken}
                          report={report}
                          canEdit={canEdit}
                        />
                      )}
                      path={`${path}/pathway-analysis`}
                    />
                    <Route
                      render={routeProps => (
                        <Slides
                          {...routeProps}
                          print={false}
                          token={value.authorizationToken}
                          report={report}
                          canEdit={canEdit}
                        />
                      )}
                      path={`${path}/slides`}
                    />
                  </>
                )}
              </SecurityContext.Consumer>
            </Switch>
          </div>
        </div>
        {Boolean(sections) && (
          <ReportSidebar sections={sections} isSidebarVisible={isSidebarVisible} reportIdent={report.ident} />
        )}
      </div>
    </ReportContext.Provider>
  );
};

export default ReportView;
