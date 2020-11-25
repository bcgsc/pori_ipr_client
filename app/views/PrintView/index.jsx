import React, { useEffect, useState, useReducer } from 'react';
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
import PrintLogo from '@/../statics/images/print_logo.svg';

import './index.scss';

const reducer = (state, action) => {
  switch (action.type) {
    case 'genomicSummary':
      return { ...state, genomicSummary: true };
    case 'probeSummary':
      return { ...state, probeSummary: true };
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
        genomicSummary: false,
        probeSummary: false,
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
    genomicSummary: false,
    probeSummary: false,
    analyst: false,
    pathway: false,
    therapeutic: false,
    slides: false,
    appendices: false,
  });
  const [isProbe, setIsProbe] = useState(false);
  const [isPrintDialogShown, setIsPrintDialogShown] = useState(false);

  useEffect(() => {
    if (!report) {
      const getReport = async () => {
        const resp = await ReportService.getReport(params.ident);
        setReport(resp);

        if (resp.type !== 'genomic') {
          setIsProbe(true);
        }
      };

      getReport();
    }
  }, [params.ident, report]);

  useEffect(() => {
    let sections;
    if (isProbe) {
      sections = ['probeSummary', 'appendices'];
    } else {
      sections = ['genomicSummary', 'analyst', 'pathway', 'therapeutic', 'slides'];
    }
    if (reportSectionsLoaded
      && Object.entries(reportSectionsLoaded).every(([section, loaded]) => loaded || !sections.includes(section))
      && !isPrintDialogShown) {
      window.print();
      setIsPrintDialogShown(true);
    }
  }, [isPrintDialogShown, isProbe, reportSectionsLoaded]);

  const probeSections = () => (
    <>
      <ProbeSummary report={report} isPrint loadedDispatch={dispatch} />
      <PageBreak report={report} />
      <Appendices report={report} isPrint isProbe loadedDispatch={dispatch} />
    </>
  );

  const genomicSections = () => (
    <>
      <GenomicSummary print loadedDispatch={dispatch} />
      <PageBreak report={report} theme={theme} />
      <AnalystComments report={report} print loadedDispatch={dispatch} />
      <PageBreak report={report} theme={theme} />
      <PathwayAnalysis report={report} print loadedDispatch={dispatch} />
      <PageBreak report={report} theme={theme} />
      <TherapeuticTargets print loadedDispatch={dispatch} />
      <PageBreak report={report} theme={theme} />
      <Slides report={report} print loadedDispatch={dispatch} theme={theme}/>
    </>
  );

  const titleBar = () => (
    <div className="print__headers">
      <div className="print__header-left">
        <img className="print__logo" src={PrintLogo} alt="" />
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
            <>
              {isProbe ? (
                probeSections()
              ) : (
                genomicSections()
              )}
            </>
          </>
        ) : null}
      </div>
    </ReportContext.Provider>
  );
};

export default Print;
