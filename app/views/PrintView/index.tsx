import React, {
  useEffect, useState, useReducer, useMemo, lazy,
} from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Previewer } from 'pagedjs';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import PageBreak from '@/components/PageBreak';
import startCase from '@/utils/startCase';
import { ReportType } from '@/context/ReportContext/types';
import { TemplateType } from '@/common';
import {
  REPORT_TYPE_TO_TITLE,
  REPORT_TYPE_TO_SUFFIX,
} from '@/constants';
import getImageDataURI from '@/utils/getImageDataURI';
import { SummaryProps } from '@/commonComponents';

import Summary from '../ReportView/components/Summary';
import RunningLeft from './components/RunningLeft';
import RunningCenter from './components/RunningCenter';
import RunningRight from './components/RunningRight';

import './index.scss';

const AnalystComments = lazy(() => import('../ReportView/components/AnalystComments'));
const PathwayAnalysis = lazy(() => import('../ReportView/components/PathwayAnalysis'));
const TherapeuticTargets = lazy(() => import('../ReportView/components/TherapeuticTargets'));
const Slides = lazy(() => import('../ReportView/components/Slides'));
const Appendices = lazy(() => import('../ReportView/components/Appendices'));

const reducer = (state, action) => {
  switch (action.type) {
    case 'summary':
      return { ...state, summary: true };
    case 'analyst-comments':
      return { ...state, 'analyst-comments': true };
    case 'pathway':
      return { ...state, pathway: true };
    case 'therapeutic':
      return { ...state, therapeutic: true };
    case 'slides':
      return { ...state, slides: true };
    case 'appendices':
      return { ...state, appendices: true };
    default:
      return {
        summary: false,
        'analyst-comments': false,
        pathway: false,
        therapeutic: false,
        slides: false,
        appendices: false,
      };
  }
};

type PrintTitleBarProps = {
  report: ReportType;
  title: string;
  subtitle: string;
  subtitleSuffix: string;
  headerImageURI: string;
  printVersion?: SummaryProps['printVersion'];
};

const PrintTitleBar = ({
  report,
  title,
  subtitle,
  subtitleSuffix,
  headerImageURI,
  printVersion = 'stable',
}: PrintTitleBarProps) => {
  if (!report) { return null; }

  let biopsyText = startCase(report?.biopsyName || 'No Biopsy Name');
  if (report?.patientInformation?.diagnosis) {
    biopsyText = biopsyText.concat(`- ${startCase(report.patientInformation.diagnosis)}`);
  }
  if (report?.patientInformation?.tumourSample && report?.patientInformation?.tumourSample.toLowerCase() !== 'undetermined') {
    biopsyText = biopsyText.concat(`(${report.patientInformation.tumourSample})`);
  }

  if (printVersion === 'beta') {
    return (
      <div className="printbeta__headers">
        <div className="printbeta__header-left">
          {headerImageURI && (
            <img className="printbeta__logo" src={headerImageURI} alt="" />
          )}
        </div>
        <div className="printbeta__header-right">
          <Typography variant="body2">{`${title ? `${title} Report: ` : ''} ${subtitle}${subtitleSuffix ? ` - ${subtitleSuffix}` : ''}`}</Typography>
          <Typography variant="body2">{biopsyText}</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="print__headers">
      <div className="print__header-left">
        {headerImageURI && (
          <img className="print__logo" src={headerImageURI} alt="" />
        )}
      </div>
      <div className="print__header-right">
        {title && (<Typography variant="h1">{`${title} Report`}</Typography>)}
        <Typography variant="h2">
          {`${subtitle}${subtitleSuffix ? ` - ${subtitleSuffix}` : ''}`}
        </Typography>
        <Typography variant="h5">
          {biopsyText}
        </Typography>
      </div>
    </div>
  );
};

type PrintPropTypes = {
  printVersion?: SummaryProps['printVersion'];
};

const Print = ({
  printVersion = 'stable',
}: PrintPropTypes): JSX.Element => {
  const params = useParams<{
    ident: string;
  }>();
  const theme = useTheme();
  const [report, setReport] = useState<ReportType>(null);
  const [reportSectionsLoaded, dispatch] = useReducer(reducer, {
    summary: false,
    'analyst-comments': false,
    pathway: false,
    therapeutic: false,
    slides: false,
    appendices: false,
  });
  const [template, setTemplate] = useState<TemplateType>(null);
  const [isPrintDialogShown, setIsPrintDialogShown] = useState(false);

  useEffect(() => {
    if (!report) {
      const getReport = async () => {
        const reportResp = await api.get(`/reports/${params.ident}`, {}).request();
        const templatesResp = await api.get('/templates', {}).request();

        setTemplate(templatesResp.find((temp) => temp.name === reportResp.template.name));
        setReport(reportResp);
      };

      getReport();
    }
  }, [params.ident, report]);

  useEffect(() => {
    if (reportSectionsLoaded
      && template?.sections.length
      && Object.entries(reportSectionsLoaded).every(([section, loaded]) => loaded || !template?.sections.includes(section))
      && !isPrintDialogShown) {
      const showPrint = async () => {
        const paged = new Previewer();
        await paged.preview(document.getElementById('root'), ['index.css'], document.body);
        document.title = `${report.patientId}_${report.template.name}_${new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }).replace(', ', '-')}`;
        window.print();
        setIsPrintDialogShown(true);
      };
      showPrint();
    }
  }, [isPrintDialogShown, report, reportSectionsLoaded, template]);

  const renderSections = useMemo(() => {
    if (report && template) {
      return (
        <>
          {template?.sections.includes('summary') && (
            <>
              <Summary templateName={report.template.name} isPrint printVersion={printVersion} loadedDispatch={dispatch} />
              <PageBreak />
            </>
          )}
          {template?.sections.includes('therapeutic-targets') && (
            <>
              <TherapeuticTargets isPrint loadedDispatch={dispatch} />
              <PageBreak />
            </>
          )}
          {template?.sections.includes('analyst-comments') && (
            <>
              <AnalystComments report={report} isPrint loadedDispatch={dispatch} />
              <PageBreak />
            </>
          )}
          {template?.sections.includes('pathway-analysis') && (
            <>
              <PathwayAnalysis report={report} isPrint loadedDispatch={dispatch} />
              <PageBreak />
            </>
          )}
          {template?.sections.includes('slides') && (
            <>
              <Slides report={report} isPrint loadedDispatch={dispatch} theme={theme} />
              <PageBreak />
            </>
          )}
          {template?.sections.includes('appendices') && (
            <Appendices report={report} isPrint isProbe={report.template.name === 'probe'} loadedDispatch={dispatch} />
          )}
        </>
      );
    }
    return null;
  }, [report, theme, template, printVersion]);

  const reportContextValue = useMemo(() => ({ report, setReport }), [report, setReport]);

  return (
    <ReportContext.Provider value={reportContextValue}>
      <div className={`${printVersion === 'beta' ? 'printbeta' : 'print'}`}>
        {report ? (
          <>
            <RunningLeft className="running-left" />
            <RunningCenter className="running-center" />
            <RunningRight className="running-right" />
            <PrintTitleBar
              report={report}
              title={REPORT_TYPE_TO_TITLE[template?.name]}
              subtitle={report.patientId}
              subtitleSuffix={REPORT_TYPE_TO_SUFFIX[template?.name]}
              headerImageURI={getImageDataURI(template?.headerImage)}
              printVersion={printVersion}
            />
            {renderSections}
          </>
        ) : null}
      </div>
    </ReportContext.Provider>
  );
};

export default Print;
