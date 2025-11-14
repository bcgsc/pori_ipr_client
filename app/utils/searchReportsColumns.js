import startCase from '@/utils/startCase';

const getUniqueVariants = (arr, key) => {
  const mapObj = new Map();
  arr.forEach((v) => {
    const prevValue = mapObj.get(v[key]);
    if (!prevValue || prevValue.type === 'new') {
      mapObj.set(v[key], v);
    }
  });
  return [...mapObj.values()];
};

function searchReportsColumns(report, analyst, reviewer, bioinformatician) {
  return {
    matchedKeyVariant: report?.genomicAlterationsIdentified ? getUniqueVariants(report?.genomicAlterationsIdentified, 'geneVariant').map((v) => v.geneVariant).join(', ') : null,
    matchedKbVariant: report?.kbMatches ? getUniqueVariants(report?.kbMatches, 'kbVariant').map((v) => v.kbVariant).join(', ') : null,
    matchedSmallMutation: report?.smallMutations ? getUniqueVariants(report?.smallMutations, 'displayName').map((v) => v.displayName).join(', ') : null,
    matchedStructuralVariant: report?.structuralVariants ? getUniqueVariants(report?.structuralVariants, 'displayName').map((v) => v.displayName).join(', ') : null,
    matchedTherapeuticTarget: report?.therapeuticTarget ? report?.therapeuticTarget.map((t) => t.therapy).join(', ') : null,
    matchedTherapeuticTargetContext: report?.therapeuticTarget ? report?.therapeuticTarget.map((t) => t.context).join(', ') : null,
    patientID: report.patientId,
    analysisBiopsy: report.biopsyName,
    reportType: report.template.name === 'probe' ? 'Targeted Gene' : startCase(report.template.name),
    state: report.state,
    caseType: report?.patientInformation?.caseType,
    project: report.projects.map((project) => project.name).sort().join(', '),
    physician: report?.patientInformation?.physician,
    analyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
    reportIdent: report.ident,
    tumourType: report?.patientInformation?.diagnosis,
    date: report.createdAt,
    reviewer: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : null,
    bioinformatician: bioinformatician ? `${bioinformatician.firstName} ${bioinformatician.lastName}` : null,
  };
}

export default searchReportsColumns;
