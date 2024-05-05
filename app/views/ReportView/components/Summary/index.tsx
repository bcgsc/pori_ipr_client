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
  // TODO remove backup template name checks when data is updateed in prod
  const summarySection = props.visibleSections.find(element => ['summary-genomic', 'summary-tgr', 'summary-pcp', 'summary-probe'].includes(element));
  if (summarySection === 'summary-probe' || templateName === 'probe') {
    return (
      <ProbeSummary {...props} />
    );
  }

  if (summarySection === 'summary-pcp' || templateName === 'pharmacogenomic') {
    console.log(templateName);
    return (
      <PharmacoGenomicSummary {...props} />
    );
  }

  if (summarySection === 'summary-tgr' || templateName === 'rapid') {
    console.log(templateName);
    return (
      <RapidSummary {...props} />
    );
  }

  if (templateName === 'genomicPatientandTumour') {
    console.log(templateName);
    return (
      <GenomicSummary {...props} />
    );
  }

  if (templateName === 'genomicAlterations') {
    console.log(templateName);
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
