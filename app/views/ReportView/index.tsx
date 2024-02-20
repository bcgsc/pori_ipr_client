import React, {
  lazy,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Switch, Route, useRouteMatch, useParams, useHistory,
} from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import { SecurityContext } from '@/context/SecurityContext';
import ReportToolbar from '@/components/ReportToolbar';
import ReportSidebar from '@/components/ReportSidebar';
import useExternalMode from '@/hooks/useExternalMode';
import ReportContext, { ReportType } from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import useResource from '@/hooks/useResource';
import useSecurity from '@/hooks/useSecurity';
import Summary from './components/Summary';
import allSections from './sections';

import './index.scss';

const EXTERNAL_ALLOWED_STATES = ['reviewed', 'completed'];

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
const Immune = lazy(() => import('./components/Immune'));
const Appendices = lazy(() => import('./components/Appendices'));
const Settings = lazy(() => import('./components/Settings'));
const Pharmacogenomic = lazy(() => import('./components/Pharmacogenomic'));
const CancerPredisposition = lazy(() => import('./components/CancerPredisposition'));

const ReportView = (): JSX.Element => {
  const { path } = useRouteMatch();
  const params = useParams<{
    ident: string,
  }>();
  const theme = useTheme();
  const history = useHistory();
  const isExternalMode = useExternalMode();
  const { reportEditAccess, adminAccess } = useResource();
  const { userDetails: { ident: userIdent } } = useSecurity();

  const [report, setReport] = useState<ReportType>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [visibleSections, setVisibleSections] = useState([]);
  const [isProbe, setIsProbe] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (!report) {
      const getReport = async () => {
        try {
          const resp = await api.get(`/reports/${params.ident}`).request();
          const templatesResp = await api.get('/templates').request();
          setReport(resp);
          if (resp.template.name === 'probe') {
            setIsProbe(true);
          } else {
            setIsProbe(false);
          }
          const template = templatesResp.find((templ) => templ.name === resp.template.name);
          setVisibleSections(template?.sections);
        } catch (getReportErr) {
          snackbar.error(`Cannot access report ${params.ident}, reason: ${getReportErr?.message} `);
          history.push('/reports');
        }
      };

      getReport();
    }
  }, [history, params.ident, report]);

  /* External users should only be allowed to access certain states
     Send them back to /reports if the report state isn't allowed */
  useEffect(() => {
    if (report) {
      if (!EXTERNAL_ALLOWED_STATES.includes(report.state) && isExternalMode) {
        snackbar.error('User does not have access to this report');
        history.push('/reports');
      }
    }
  }, [report, isExternalMode, history]);

  useEffect(() => {
    if (report) {
      const getSignatures = async () => {
        const req = api.get(`/reports/${params.ident}/signatures`);
        const resp = await req.request();
        if (resp && ((resp.reviewerSignature && resp.reviewerSignature.ident)
          || (resp.authorSignature && resp.authorSignature.ident))) {
          setIsSigned(true);
        }
      };

      getSignatures();
    }
  }, [params.ident, report]);

  const reportValue = useMemo(() => {
    if (!report) { return null; }
    let canEdit = reportEditAccess;
    /**
     * Check report specific permissions if user isn't admin or overall report access
     */
    if (!adminAccess && !reportEditAccess) {
      if (report.users && report.users.some(({ user: { ident: i } }) => i === userIdent)) {
        canEdit = true;
      } else {
        canEdit = false;
      }
    }

    return ({ canEdit, report, setReport });
  }, [report, setReport, adminAccess, reportEditAccess, userIdent]);
  const isSignedValue = useMemo(() => ({ isSigned, setIsSigned }), [isSigned, setIsSigned]);

  if (!report) { return null; }

  return (
    <ReportContext.Provider value={reportValue}>
      <ConfirmContext.Provider value={isSignedValue}>
        {/* alert-dialog has a dialog attach to it upon report edit after signed */}
        <div id="alert-dialog" />
        <div className="report__container">
          <div className="report__content-container">
            {Boolean(report) && (
              <ReportToolbar
                diagnosis={report.patientInformation.diagnosis}
                patientId={report.patientId}
                type={report.template.name}
                state={report.state}
                isSidebarVisible={isSidebarVisible}
                onSidebarToggle={setIsSidebarVisible}
              />
            )}
            <div className="report__content">
              <Switch>
                {report && (
                  <Route
                    render={(routeProps) => (
                      <Summary
                        {...routeProps}
                        templateName={report.template.name}
                        isPrint={false}
                        report={report}
                        canEdit={reportValue.canEdit}
                      />
                    )}
                    path={`${path}/summary`}
                  />
                )}
                <Route
                  render={(routeProps) => (
                    <AnalystComments
                      {...routeProps}
                      print={false}
                      report={report}
                      canEdit={reportValue.canEdit}
                      setIsSigned={setIsSigned}
                      isSigned={isSigned}
                    />
                  )}
                  path={`${path}/analyst-comments`}
                />
                <Route
                  render={(routeProps) => (
                    <TherapeuticTargets {...routeProps} print={false} />
                  )}
                  path={`${path}/therapeutic-targets`}
                />
                <Route
                  render={(routeProps) => (
                    <KbMatches {...routeProps} print={false} />
                  )}
                  path={`${path}/kb-matches`}
                />
                <Route
                  render={(routeProps) => (
                    <Discussion {...routeProps} print={false} report={report} canEdit={reportValue.canEdit} />
                  )}
                  path={`${path}/discussion`}
                />
                <Route
                  render={(routeProps) => (
                    <Microbial {...routeProps} print={false} report={report} canEdit={reportValue.canEdit} />
                  )}
                  path={`${path}/microbial`}
                />
                <Route
                  render={(routeProps) => (
                    <MutationSignatures {...routeProps} print={false} />
                  )}
                  path={`${path}/mutation-signatures`}
                />
                <Route
                  render={(routeProps) => (
                    <MutationBurden {...routeProps} print={false} />
                  )}
                  path={`${path}/mutation-burden`}
                />
                <Route
                  render={(routeProps) => (
                    <ExpressionCorrelation {...routeProps} print={false} />
                  )}
                  path={`${path}/expression-correlation`}
                />
                <Route
                  render={(routeProps) => (
                    <SmallMutations {...routeProps} print={false} theme={theme} report={report} canEdit={reportValue.canEdit} />
                  )}
                  path={`${path}/small-mutations`}
                />
                <Route
                  render={(routeProps) => (
                    <CopyNumber {...routeProps} print={false} theme={theme} report={report} canEdit={reportValue.canEdit} />
                  )}
                  path={`${path}/copy-number`}
                />
                <Route
                  render={(routeProps) => (
                    <StructuralVariants {...routeProps} print={false} theme={theme} report={report} canEdit={reportValue.canEdit} />
                  )}
                  path={`${path}/structural-variants`}
                />
                <Route
                  render={(routeProps) => (
                    <Expression {...routeProps} print={false} />
                  )}
                  path={`${path}/expression`}
                />
                <Route
                  render={(routeProps) => (
                    <Immune {...routeProps} print={false} />
                  )}
                  path={`${path}/immune`}
                />
                <Route path={`${path}/pharmacogenomic`}>
                  <Pharmacogenomic />
                </Route>
                <Route path={`${path}/cancer-predisposition`}>
                  <CancerPredisposition />
                </Route>
                <Route
                  render={(routeProps) => (
                    <Appendices {...routeProps} isPrint={false} theme={theme} isProbe={isProbe} report={report} />
                  )}
                  path={`${path}/appendices`}
                />
                <Route
                  render={(routeProps) => (
                    <Settings
                      {...routeProps}
                      isProbe={isProbe}
                    />
                  )}
                  path={`${path}/settings`}
                />
                {/* Need token for FileUpload API call */}
                <SecurityContext.Consumer>
                  {(value) => (
                    <>
                      <Route
                        render={(routeProps) => (
                          <PathwayAnalysis
                            {...routeProps}
                            print={false}
                            token={value.authorizationToken}
                            report={report}
                            canEdit={reportValue.canEdit}
                          />
                        )}
                        path={`${path}/pathway-analysis`}
                      />
                      <Route
                        render={(routeProps) => (
                          <Slides
                            {...routeProps}
                            print={false}
                            token={value.authorizationToken}
                            report={report}
                            canEdit={reportValue.canEdit}
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
          {report && (
            <ReportSidebar
              visibleSections={visibleSections || ['summary']}
              allSections={allSections}
              isSidebarVisible={isSidebarVisible}
              canEdit={reportValue.canEdit}
            />
          )}
        </div>
      </ConfirmContext.Provider>
    </ReportContext.Provider>
  );
};

export default ReportView;
