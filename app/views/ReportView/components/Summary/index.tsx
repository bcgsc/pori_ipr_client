import { SummaryProps } from '@/commonComponents';
import React, { lazy } from 'react';

const GenomicSummary = lazy(() => import('../GenomicSummary'));
const ProbeSummary = lazy(() => import('../ProbeSummary'));
const PharmacoGenomicSummary = lazy(() => import('../PharmacoGenomicSummary'));
const RapidSummary = lazy(() => import('../RapidSummary'));

const Summary = ({
  templateName,
  ...props
}: SummaryProps): JSX.Element => {
  if (templateName === 'probe') {
    return (
      <ProbeSummary {...props} />
    );
  }

  if (templateName === 'pharmacogenomic') {
    return (
      <PharmacoGenomicSummary {...props} />
    );
  }

  if (templateName === 'rapid') {
    return (
      <RapidSummary {...props} />
    );
  }

  return (
    <GenomicSummary {...props} />
  );
};

export default Summary;
