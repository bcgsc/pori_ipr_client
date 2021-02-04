import React, {
<<<<<<< HEAD
  useEffect, useState, useReducer, useCallback,
=======
  useEffect, useState, useReducer, useMemo,
>>>>>>> 93bc9e5ceaf83c1b24006d06dd716f3d60b0743e
} from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

import ReportContext from '../../components/ReportContext';
import ReportService from '@/services/reports/report.service';
import GenomicSummary from '../ReportView/components/GenomicSummary';
import ProbeSummary from '../ReportView/components/ProbeSummary';
import AnalystComments from '../ReportView/components/AnalystComments';
import PathwayAnalysis from '../ReportView/components/PathwayAnalysis';
import TherapeuticTargets from '../ReportView/components/TherapeuticTargets/components/PrintTables';
import Slides from '../ReportView/components/Slides';
import Appendices from '../ReportView/components/Appendices';
import PageBreak from '@/components/PageBreak';
import startCase from '@/utils/startCase';

import './index.scss';

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
  const [sections, setSections] = useState([]);
  const [isPrintDialogShown, setIsPrintDialogShown] = useState(false);

  useEffect(() => {
    if (!report) {
      const getReport = async () => {
        const resp = await ReportService.getReport(params.ident);
        setReport(resp);
        const { template: { sections: sectionsResp } } = resp;
        setSections(sectionsResp);
      };

      getReport();
    }
  }, [params.ident, report]);

  useEffect(() => {
    if (reportSectionsLoaded
      && sections.length
      && Object.entries(reportSectionsLoaded).every(([section, loaded]) => loaded || !sections.includes(section))
      && !isPrintDialogShown) {
      window.print();
      setIsPrintDialogShown(true);
    }
  }, [isPrintDialogShown, report, reportSectionsLoaded, sections]);

<<<<<<< HEAD
  const renderSections = useCallback(() => (
=======
  const renderSections = useMemo(() => (
>>>>>>> 93bc9e5ceaf83c1b24006d06dd716f3d60b0743e
    <>
      {sections.includes('summary') && report.template.name === 'probe' && (
        <>
          <ProbeSummary report={report} isPrint loadedDispatch={dispatch} />
          <PageBreak report={report} theme={theme} />
        </>
      )}
      {sections.includes('summary') && report.template.name !== 'probe' && (
        <>
          <GenomicSummary print loadedDispatch={dispatch} />
          <PageBreak report={report} theme={theme} />
        </>
      )}
      {sections.includes('analyst-comments') && (
        <>
          <AnalystComments report={report} print loadedDispatch={dispatch} />
          <PageBreak report={report} theme={theme} />
        </>
      )}
      {sections.includes('pathway-analysis') && (
        <>
          <PathwayAnalysis report={report} print loadedDispatch={dispatch} />
          <PageBreak report={report} theme={theme} />
        </>
      )}
      {sections.includes('therapeutic-targets') && (
        <>
          <TherapeuticTargets print loadedDispatch={dispatch} />
          <PageBreak report={report} theme={theme} />
        </>
      )}
      {sections.includes('slides') && (
        <>
          <Slides report={report} print loadedDispatch={dispatch} theme={theme} />
          <PageBreak report={report} theme={theme} />
        </>
      )}
      {sections.includes('appendices') && (
        <>
          <Appendices report={report} isPrint isProbe loadedDispatch={dispatch} />
          <PageBreak report={report} theme={theme} />
        </>
      )}
    </>
  ), [report, theme, sections]);

  const titleBar = () => (
    <div className="print__headers">
      <div className="print__header-left">
        {report.template && report.template.headerImage && (
          <img className="print__logo" src={report.template.headerImage.data} alt="" />
        )}
      </div>
      <div className="print__header-right">
        <Typography variant="h1">
          {`${report.patientId}${report.alternateIdentifier ? `(${report.alternateIdentifier})` : ''}`}
        </Typography>
        <Typography variant="h5">
          {`${startCase(report.biopsyName || 'No Biopsy Name')} - ${startCase(report.patientInformation.diagnosis)} (${report.patientInformation.tumourSample})`}
        </Typography>
      </div>
    </div>
  );

  return (
    <ReportContext.Provider value={{ report, setReport }}>
      <div className="print">
        {report ? (
          <>
            {titleBar()}
            {renderSections}
          </>
        ) : null}
      </div>
    </ReportContext.Provider>
  );
};

export default Print;
