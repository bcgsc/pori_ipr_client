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

const Print = (): JSX.Element => {
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
              <Summary templateName={report.template.name} isPrint loadedDispatch={dispatch} />
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
          {template?.sections.includes('therapeutic-targets') && (
            <>
              <TherapeuticTargets isPrint loadedDispatch={dispatch} />
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
  }, [report, theme, template]);

  const titleBar = useMemo(() => {
    if (report && template) {
      const printTitle = REPORT_TYPE_TO_TITLE[template.name];
      const headerSubtitle = report.patientId;
      const headerSubtitleSuffix = REPORT_TYPE_TO_SUFFIX[template.name];
      return (
        <div className="print__headers">
          <div className="print__header-left">
            {template?.headerImage && (
              <img className="print__logo" src={getImageDataURI(template.headerImage)} alt="" />
            )}
          </div>
          <div className="print__header-right">
            {printTitle && (<Typography variant="h1">{`${printTitle} Report`}</Typography>)}
            <Typography variant="h2">
              {`${headerSubtitle}${headerSubtitleSuffix ? ` - ${headerSubtitleSuffix}` : ''}`}
            </Typography>
            <Typography variant="h5">
              {`${startCase(report.biopsyName || 'No Biopsy Name')} ${
                report.patientInformation.diagnosis ? `- ${startCase(report.patientInformation.diagnosis)}` : ''
              } ${
                report.patientInformation.tumourSample ? `(${report.patientInformation.tumourSample})` : ''
              }`}
            </Typography>
          </div>
        </div>
      );
    }
    return null;
  }, [report, template]);

  const reportContextValue = useMemo(() => ({ report, setReport }), [report, setReport]);

  return (
    <ReportContext.Provider value={reportContextValue}>
      <div className="print">
        {report ? (
          <>
            <RunningLeft className="running-left" />
            <RunningCenter className="running-center" />
            <RunningRight className="running-right" />
            {titleBar}
            {renderSections}
          </>
        ) : null}
      </div>
    </ReportContext.Provider>
  );
};

export default Print;
