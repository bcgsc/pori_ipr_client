import { RecordDefaults, UserType, TemplateType } from '@/common';
import { ProjectType } from '@/views/AdminView/types';
import React from 'react';

type PatientInformationType = {
  age: string | null;
  biopsySite: string | null;
  caseType: 'Pediatric' | 'Adult' | null;
  constitutionalProtocol: string | null;
  constitutionalSample: string | null;
  diagnosis: string | null;
  gender: string | null;
  physician: string | null;
  reportDate: string | null;
  tumourProtocol: string | null;
  tumourSample: string | null;
  oncotreeTumourType?: string | null;
  kbDiseaseMatch?: string | null;
} & RecordDefaults;

type SampleInfoType = {
  biopsySite: string | null;
  collectionDate: string | null;
  'Patho TC': string | null;
  'Primary Site': string | null;
  Sample: string | null;
  'Sample Name': string | null;
};

type UserRoleType = {
  role: string;
  user: UserType;
} & RecordDefaults;

type ReportType = {
  alternateIdentifier?: string;
  pediatricIds?: string;
  analysisStartedAt: string | null;
  biopsyName?: string;
  createdBy?: UserType;
  expression_matrix: string;
  kbVersion: string;
  patientId: string;
  patientInformation: PatientInformationType,
  ploidy: string;
  projects?: ProjectType[];
  reportVersion: string;
  sampleInfo: SampleInfoType[];
  state: string;
  subtyping: string;
  template: TemplateType;
  tumourContent?: number;
  type: string;
  users: UserRoleType[];
  oncotreeTumourType: string;
  kbDiseaseMatch: string;
  m1m2Score: number;
  captiv8Score: number;
  appendix?: string;
} & RecordDefaults;

type ReportContextType = {
  /** Is current report editable by user */
  canEdit: boolean;
  /** Current report that's being viewed */
  report: ReportType | null,
  /** Set new current report */
  setReport: React.Dispatch<React.SetStateAction<ReportType>>;
};

export {
  PatientInformationType,
  ReportContextType,
  ReportType,
  SampleInfoType,
};
