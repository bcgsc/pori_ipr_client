import React, { lazy } from 'react';

const GenomicSummary = lazy(() => import('../GenomicSummary'));
const ProbeSummary = lazy(() => import('../ProbeSummary'));
const PharmacoGenomicSummary = lazy(() => import('../PharmacoGenomicSummary'));

type SummaryProps = {
  templateName: string;
  props: Record<string, unknown>;
};

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

  return (
    <GenomicSummary {...props} />
  );
};

export default Summary;
