import React, { useEffect, useState, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

import ReportService from '@/services/reports/report.service';
import GenomicSummary from '../ReportView/components/GenomicSummary';
import ProbeSummary from '../ReportView/components/ProbeSummary';
import AnalystComments from '../ReportView/components/AnalystComments';
import PathwayAnalysis from '../ReportView/components/PathwayAnalysis';
import TherapeuticTargets from '../ReportView/components/TherapeuticTargets/components/PrintTables';
import Slides from '../ReportView/components/Slides';
import Appendices from '../ReportView/components/Appendices';
import PageBreak from '@/components/PageBreak';
import PrintLogo from '@/../statics/images/print_logo.png';

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
  }, [report]);

  useEffect(() => {
    let sections;
    if (isProbe) {
      sections = ['probeSummary', 'appendices'];
    } else {
      sections = ['genomicSummary', 'analyst', 'pathway', 'therapeutic', 'slides'];
    }
    if (reportSectionsLoaded && Object.entries(reportSectionsLoaded).every(([section, loaded]) => loaded || !sections.includes(section))) {
      window.print();
    }
  }, [reportSectionsLoaded]);

  const probeSections = () => (
    <>
      <ProbeSummary report={report} print loadedDispatch={dispatch} />
      <PageBreak report={report} />
      <Appendices report={report} print isProbe loadedDispatch={dispatch} />
    </>
  );

  const genomicSections = () => (
    <>
      <GenomicSummary report={report} print loadedDispatch={dispatch} />
      <PageBreak report={report} theme={theme} />
      <AnalystComments report={report} print loadedDispatch={dispatch} />
      <PageBreak report={report} theme={theme} />
      <PathwayAnalysis report={report} print loadedDispatch={dispatch} />
      <PageBreak report={report} theme={theme} />
      <TherapeuticTargets report={report} loadedDispatch={dispatch} />
      <PageBreak report={report} theme={theme} />
      <Slides report={report} print loadedDispatch={dispatch} theme={theme}/>
    </>
  );

  const titleBar = () => (
    <div className="print__headers">
      <div className="print__header-top">
        <img className="print__logo" src={PrintLogo} alt="" />
        <div>
          <Typography align="right" variant="body2">
            Tumour Genome Analysis
          </Typography>
          <Typography align="right" variant="body2">
            Whole Genome; Transcriptome; Somatic
          </Typography>
        </div>
      </div>
      <div className="print__header-middle">
        <Typography variant="body2">
          {`Report version: ${report.reportVersion}`}
        </Typography>
        <Typography variant="body2">
          {`Knowledgebase version: ${report.kbVersion}`}
        </Typography>
      </div>
      <div className="print__header-bottom">
        <Typography align="center" variant="h2">
          {report.patientId}
        </Typography>
      </div>
    </div>
  );

  return (
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
  );
};

export default Print;
