import { SummaryProps } from '@/commonComponents';
import React, { lazy } from 'react';

const GenomicSummary = lazy(() => import('../GenomicSummary'));
const KeyAlterations = lazy(() => import('../GenomicSummary/components/KeyAlterations'));
const ProbeSummary = lazy(() => import('../ProbeSummary'));
const PharmacoGenomicSummary = lazy(() => import('../PharmacoGenomicSummary'));
const RapidSummary = lazy(() => import('../RapidSummary'));

const Summary = ({
  templateName,
  ...props
}: SummaryProps): JSX.Element => {
  const summarySection = props.visibleSections.find(element => ['summary-genomic', 'summary-tgr', 'summary-pcp', 'summary-probe'].includes(element));
  if (summarySection === 'summary-probe') {
    return (
      <ProbeSummary {...props} />
    );
  }

  if (summarySection === 'summary-pcp') {
    return (
      <PharmacoGenomicSummary {...props} />
    );
  }

  if (summarySection === 'summary-tgr') {
    return (
      <RapidSummary {...props} />
    );
  }

  if (templateName === 'genomicPatientandTumour') {
    return (
      <GenomicSummary {...props} />
    );
  }

  if (templateName === 'genomicAlterations') {
    return (
      <KeyAlterations {...props} />
    );
  }

  // default - summary-genomic
  return (
    <>
      <GenomicSummary {...props} />
      <KeyAlterations {...props} />
    </>
  );
};

export default Summary;
