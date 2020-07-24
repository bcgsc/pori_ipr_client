import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';

import ReportService from '@/services/reports/report.service';
import GenomicSummary from '../ReportView/components/GenomicSummary';
import ProbeSummary from '../ReportView/components/ProbeSummary';
import AnalystComments from '../ReportView/components/AnalystComments';
import PathwayAnalysis from '../ReportView/components/PathwayAnalysis';
import KbMatches from '../ReportView/components/KbMatches';
import TherapeuticTargets from '../ReportView/components/TherapeuticTargets/components/PrintTables';
import Slides from '../ReportView/components/Slides';
import Appendices from '../ReportView/components/Appendices';
import PageBreak from '@/components/PageBreak';
import PrintLogo from '@/../statics/images/print_logo.png';

import './index.scss';

const Print = () => {
  const params = useParams();
  const [report, setReport] = useState();
  const [isProbe, setIsProbe] = useState(false);

  useEffect(() => {
    if (!report) {
      const getReport = async () => {
        const resp = await ReportService.getReport(params.ident);
        setReport(resp);

        if (resp.type !== 'genomic') {
          setIsProbe(true);
        }
        setTimeout(() => {
          window.print();
        }, 1500);
      };

      getReport();
    }
  }, [report]);

  const probeSections = () => (
    <>
      <ProbeSummary report={report} print />
      <PageBreak report={report} />
      <KbMatches report={report} print />
      <PageBreak report={report} />
      <Appendices report={report} print isProbe />
    </>
  );

  const genomicSections = () => (
    <>
      <GenomicSummary report={report} print />
      <PageBreak report={report} />
      <AnalystComments report={report} print />
      <PageBreak report={report} />
      <PathwayAnalysis report={report} print />
      <PageBreak report={report} />
      <TherapeuticTargets report={report} />
      <PageBreak report={report} />
      <Slides report={report} print />
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
