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
import { Typography } from '@mui/material';
import { SecurityContext } from '@/context/SecurityContext';
import ReportToolbar from '@/components/ReportToolbar';
import ReportSidebar from '@/components/ReportSidebar';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import snackbar from '@/services/SnackbarUtils';
import useResource from '@/hooks/useResource';
import useSecurity from '@/hooks/useSecurity';
import { useReport, useReportSignatures, useTemplatesAll } from '@/queries/get';
import { ReportType, TemplateType } from '@/common';
import { SignatureType } from '@/components/SignatureCard';

import Summary from './components/Summary';
import allSections from './sections';
import './index.scss';

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
  const {
    reportEditAccess, adminAccess, nonproductionAccess, unreviewedAccess, nonproductionStates, unreviewedStates,
  } = useResource();
  const { userDetails: { ident: userIdent } } = useSecurity();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [visibleSections, setVisibleSections] = useState([]);
  const [reportTemplateName, setReportTemplateName] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: report, refetch } = useReport<ReportType>(
    params.ident,
    {
      staleTime: Infinity,
      enabled: Boolean(params.ident),
      onError: (err) => {
        const message = `Cannot access report ${params.ident}, reason: ${err?.message}`;
        snackbar.error(message);
        setError(message);
      },
      onSuccess: (rpt) => {
        setReportTemplateName(rpt.template.name);
      },
    },
  );

  const { data: templates } = useTemplatesAll<TemplateType[]>({
    staleTime: Infinity,
    enabled: Boolean(report?.template?.name),
    onError: (err) => {
      console.error('Unable to obtain templates', err);
    },
  });

  useReportSignatures<SignatureType>(
    report?.ident,
    {
      staleTime: Infinity,
      enabled: Boolean(report?.ident),
      onError: (signaturesErr) => {
        console.error('Unable to obtain report signatures', signaturesErr);
      },
      onSuccess: (sigs) => {
        if (!sigs) { return; }
        if (sigs.reviewerSignature?.ident || sigs.authorSignature?.ident) {
          setIsSigned(true);
        }
      },
    },
  );

  useEffect(() => {
    if (templates) {
      const targetTemplate = templates.find(
        ({ name }) => name === reportTemplateName,
      );
      setVisibleSections(targetTemplate?.sections);
    }
  }, [templates, reportTemplateName]);

  /* External users should only be allowed to access certain states
     Send them back to /reports if the report state isn't allowed */
  useEffect(() => {
    if (report) {
      if (unreviewedStates.includes(report.state) && !unreviewedAccess) {
        const message = 'User does not have access to this report; it is unreviewed';
        snackbar.error(message);
        setError(message);
      }
      if (nonproductionStates.includes(report.state) && !nonproductionAccess) {
        const message = 'User does not have access to this report; it is nonproduction';
        snackbar.error(message);
        setError(message);
      }
    }
  }, [report, unreviewedAccess, unreviewedStates, nonproductionAccess, nonproductionStates, history]);

  const reportValue = useMemo(() => {
    if (!report) { return null; }
    /**
     * Note, this param should be used for report edit access first
     */
    let canEdit = reportEditAccess;
    /**
     * Checks if user is assigned to report, if not admin
     */
    if (!adminAccess && !reportEditAccess) {
      if (report.users && report.users.some(({ user: { ident: i } }) => i === userIdent)) {
        canEdit = true;
      } else if ((report.state).toLocaleLowerCase() === 'completed') {
        canEdit = false;
      } else {
        canEdit = false;
      }
    }

    return ({
      canEdit, report, refetchReport: refetch, reportTemplateName,
    });
  }, [report, reportTemplateName, adminAccess, reportEditAccess, userIdent, refetch]);

  const isSignedValue = useMemo(() => ({ isSigned, setIsSigned }), [isSigned, setIsSigned]);

  if (!report && error) {
    return (
      <div>
        {error ? (
          <div className="error-centered">
            <Typography color="error" gutterBottom variant="h2">Error: Cannot access report</Typography>
            <Typography paragraph>An error occurred while accessing the report. please logout and try again or contact your administrator if the problem persists</Typography>
            <Typography paragraph>{error}</Typography>
          </div>
        ) : null}
      </div>
    );
  }

  const isProbe = reportTemplateName === 'probe';

  if (!reportValue) {
    return null;
  }

  const { report: contextReport } = reportValue;

  return (
    <ReportContext.Provider value={reportValue}>
      <ConfirmContext.Provider value={isSignedValue}>
        {/* alert-dialog has a dialog attach to it upon report edit after signed */}
        <div id="alert-dialog" />
        <div className="report__container">
          <div className="report__content-container">
            {Boolean(contextReport) && (
              <ReportToolbar
                diagnosis={contextReport.patientInformation.diagnosis}
                patientId={contextReport.patientId}
                type={contextReport.template.name}
                state={contextReport.state}
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
                        visibleSections={visibleSections}
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
            />
          )}
        </div>
      </ConfirmContext.Provider>
    </ReportContext.Provider>
  );
};

export default ReportView;
