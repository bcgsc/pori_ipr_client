import { ReportType } from '@/common';
import { UseQueryResult } from 'react-query';

type SampleInfoType = {
  biopsySite: string | null;
  biopsyType: string | null;
  collectionDate: string | null;
  pathoTc: string | null;
  primarySite: string | null;
  sample: string | null;
  sampleName: string | null;
};

type ReportContextType = {
  /** Is current report editable by user */
  canEdit: boolean;
  /** Current report that's being viewed */
  report: ReportType | null;
  reportTemplateName: string;
  refetchReport: UseQueryResult<ReportType>['refetch'];
};

export {
  ReportContextType,
  SampleInfoType,
};
