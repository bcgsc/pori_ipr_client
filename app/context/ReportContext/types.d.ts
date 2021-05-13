import { RecordDefaults } from '@/common';
import React from 'react';

type PatientInformationType = {
  age: string | null;
  biopsySite: string | null;
  caseType: 'Pediatric' | 'Adult';
  constitutionalProtocol: string | null;
  constitutionalSample: string | null;
  diagnosis: string | null;
  gender: string | null;
  physician: string | null;
  reportDate: string | null;
  tumourProtocol: string | null;
  tumourSample: string | null;
} & RecordDefaults;

type SampleInfoType = {
  biopsySite: string | null;
  collectionDate: string | null;
  'Patho TC': string | null;
  'Primary Site': string | null;
  Sample: string | null;
  'Sample Name': string | null;
};

type ReportType = {
  alternateIdentifier?: string;
  biopsyName?: string;
  kbVersion: string;
  patientId: string;
  patientInformation: PatientInformationType,
  ploidy: string;
  reportVersion: string;
  sampleInfo: SampleInfoType[];
  state: string;
  subtyping: string;
  tumourContent?: number;
  type: string;
} & RecordDefaults;

type ReportContextType = {
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
