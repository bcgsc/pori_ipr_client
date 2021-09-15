import React, {
  useEffect, useState, useReducer, useMemo, lazy,
} from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Previewer } from 'pagedjs';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import PageBreak from '@/components/PageBreak';
import startCase from '@/utils/startCase';
import RunningLeft from './components/RunningLeft';
import RunningCenter from './components/RunningCenter';
import RunningRight from './components/RunningRight';

import './index.scss';

const GenomicSummary = lazy(() => import('../ReportView/components/GenomicSummary'));
const ProbeSummary = lazy(() => import('../ReportView/components/ProbeSummary'));
const AnalystComments = lazy(() => import('../ReportView/components/AnalystComments'));
const PathwayAnalysis = lazy(() => import('../ReportView/components/PathwayAnalysis'));
const TherapeuticTargets = lazy(() => import('../ReportView/components/TherapeuticTargets/components/PrintTables'));
const Slides = lazy(() => import('../ReportView/components/Slides'));
const Appendices = lazy(() => import('../ReportView/components/Appendices'));

const reducer = (state, action) => {
  switch (action.type) {
    case 'summary':
      return { ...state, summary: true };
    case 'analyst':
      return { ...state, analyst: true };
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
        analyst: false,
        pathway: false,
        therapeutic: false,
        slides: false,
        appendices: false,
      };
  }
};

const Print = () => {
  const params = useParams();
  const theme = useTheme();
  const [report, setReport] = useState();
  const [reportSectionsLoaded, dispatch] = useReducer(reducer, {
    summary: false,
    analyst: false,
    pathway: false,
    therapeutic: false,
    slides: false,
    appendices: false,
  });
  const [template, setTemplate] = useState();
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
        let paged = new Previewer();
        await paged.preview(document.getElementById('root'), ['index.css'], document.body);
        window.print();
        setIsPrintDialogShown(true);
      }
      showPrint();
    }
  }, [isPrintDialogShown, report, reportSectionsLoaded, template]);

  const renderSections = useMemo(() => {
    if (report && template) {
      return (
        <>
          {template?.sections.includes('summary') && report.template.name === 'probe' && (
            <>
              <ProbeSummary report={report} isPrint loadedDispatch={dispatch} />
              <PageBreak />
            </>
          )}
          {template?.sections.includes('summary') && report.template.name !== 'probe' && (
            <>
              <GenomicSummary print loadedDispatch={dispatch} />
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
              <TherapeuticTargets print loadedDispatch={dispatch} />
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
      return (
        <div className="print__headers">
          <div className="print__header-left">
            {template?.headerImage && (
              <img className="print__logo" src={template.headerImage.data} alt="" />
            )}
          </div>
          <div className="print__header-right">
            <Typography variant="h1">
              {report.patientId}
            </Typography>
            <Typography variant="h5">
              {`${startCase(report.biopsyName || 'No Biopsy Name')} - ${startCase(report.patientInformation.diagnosis)} (${report.patientInformation.tumourSample})`}
            </Typography>
          </div>
        </div>
      );
    }
    return null;
  }, [report, template]);

  return (
    <ReportContext.Provider value={{ report, setReport }}>
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
