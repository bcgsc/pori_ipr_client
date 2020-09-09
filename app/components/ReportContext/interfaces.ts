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

interface ReportContextInterface {
  /** Current report that's being viewed */
  report: {
    alternateIdentifier?: string,
    biopsyName?: string,
    createdAt: string,
    ident: string,
    patientId: string,
    patientInformation: PatientInformationInterface,
    state: string,
    tumourContent?: number,
    type: string,
  } | null,
  /** Set new current report */
  setReport: Function,
}

export {
  PatientInformationInterface,
  ReportContextInterface,
};
