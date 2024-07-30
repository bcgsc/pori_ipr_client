import { SummaryProps } from '@/commonComponents';
import React from 'react';

import GenomicSummary from '../GenomicSummary';
import KeyAlterations from '../GenomicSummary/components/KeyAlterations';
import ProbeSummary from '../ProbeSummary';
import PharmacoGenomicSummary from '../PharmacoGenomicSummary';
import RapidSummary from '../RapidSummary';

const Summary = ({
  templateName,
  visibleSections,
  ...props
}: SummaryProps): JSX.Element => {
  // TODO remove backup template name checks when data is updated in prod
  let summarySection;
  if (visibleSections) {
    summarySection = visibleSections.find((element) => ['summary-genomic', 'summary-tgr', 'summary-pcp', 'summary-probe'].includes(element));
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

  // default - summary-genomic or summary
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

  return (
    <>
      <GenomicSummary {...props} />
      <KeyAlterations {...props} />
    </>
  );
};

export default Summary;
