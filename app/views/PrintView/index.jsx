import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ReportService from '@/services/reports/report.service';
import GenomicSummary from '../ReportView/components/GenomicSummary';
import ProbeSummary from '../ReportView/components/ProbeSummary';
import AnalystComments from '../ReportView/components/AnalystComments';
import PathwayAnalysis from '../ReportView/components/PathwayAnalysis';
import KbMatches from '../ReportView/components/KbMatches';
import TherapeuticTargets from '../ReportView/components/TherapeuticTargets';
import Slides from '../ReportView/components/Slides';
import Appendices from '../ReportView/components/Appendices';

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
      };

      getReport();
    }
  }, [report]);

  const probeSections = () => (
    <>
      <ProbeSummary report={report} print />
      <KbMatches report={report} print />
      <Appendices report={report} print isProbe />
    </>
  );

  const genomicSections = () => (
    <>
      <GenomicSummary report={report} print />
      <AnalystComments report={report} print />
      <PathwayAnalysis report={report} print />
      <TherapeuticTargets report={report} print />
      <Slides report={report} print />
    </>
  );

  return (
    <div className="print">
      {isProbe ? (
        probeSections()
      ) : (
        genomicSections()
      )}
    </div>
  );
};

export default Print;
