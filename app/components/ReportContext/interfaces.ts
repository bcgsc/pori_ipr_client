interface PatientInformationInterface {
  age: string | null,
  biopsySite: string | null,
  caseType: 'Pediatric' | 'Adult',
  constitutionalProtocol: string | null,
  constitutionalSample: string | null,
  createdAt: string,
  diagnosis: string | null,
  gender: string | null,
  ident: string,
  physician: string | null,
  reportDate: string | null,
  tumourProtocol: string | null,
  tumourSample: string | null,
  updatedAt: string | null,
}

interface SampleInfoInterface {
  biopsySite: string | null,
  collectionDate: string | null,
  'Patho TC': string | null,
  'Primary Site': string | null,
  Sample: string | null,
  'Sample Name': string | null,
}

interface ReportContextInterface {
  /** Current report that's being viewed */
  report: {
    alternateIdentifier?: string,
    biopsyName?: string,
    createdAt: string,
    ident: string,
    patientId: string,
    patientInformation: PatientInformationInterface,
    ploidy: string,
    sampleInfo: Array<SampleInfoInterface>
    state: string,
    subtyping: string,
    tumourContent?: number,
    type: string,
  } | null,
  /** Set new current report */
  setReport: (newValue: Record<string, unknown>) => void,
}

export {
  PatientInformationInterface,
  ReportContextInterface,
};
