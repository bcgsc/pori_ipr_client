import { SummaryProps } from '@/commonComponents';
import React, { lazy } from 'react';

const GenomicSummary = lazy(() => import('../GenomicSummary'));
const KeyAlterations = lazy(() => import('../GenomicSummary/components/KeyAlterations'));
const ProbeSummary = lazy(() => import('../ProbeSummary'));
const PharmacoGenomicSummary = lazy(() => import('../PharmacoGenomicSummary'));
const RapidSummary = lazy(() => import('../RapidSummary'));

const Summary = ({
  templateName,
  visibleSections,
  ...props
}: SummaryProps): JSX.Element => {
  // TODO remove backup template name checks when data is updated in prod
  let summarySection;
  if (visibleSections) {
    summarySection = visibleSections.find(element => ['summary-genomic', 'summary-tgr', 'summary-pcp', 'summary-probe'].includes(element));
  }

  if (summarySection === 'summary-probe' || templateName === 'probe') {
    return (
      <ProbeSummary {...props} />
    );
  }

  if (summarySection === 'summary-pcp' || templateName === 'pharmacogenomic') {
    return (
      <PharmacoGenomicSummary {...props} />
    );
  }

  if (summarySection === 'summary-tgr' || templateName === 'rapid') {
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

  // default - summary-genomic or summary
  return (
    <>
      <GenomicSummary {...props} />
      <KeyAlterations {...props} />
    </>
  );
};

export default Summary;
