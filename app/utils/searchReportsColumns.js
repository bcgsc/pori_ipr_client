import startCase from '@/utils/startCase';

const getUniqueKeyVariants = (arr) => {
  const mapObj = new Map();
  arr.forEach((v) => {
    const prevValue = mapObj.get(v.geneVariant);
    if (!prevValue || prevValue.type === 'new') {
      mapObj.set(v.geneVariant, v);
    }
  });
  return [...mapObj.values()];
};

const getUniqueKbVariants = (arr) => {
  const mapObj = new Map();
  arr.forEach((v) => {
    const prevValue = mapObj.get(v.kbVariant);
    if (!prevValue || prevValue.type === 'new') {
      mapObj.set(v.kbVariant, v);
    }
  });
  return [...mapObj.values()];
};

function searchReportsColumns(report, analyst, reviewer, bioinformatician) {
  return {
    matchedKeyVariant: report?.genomicAlterationsIdentified ? getUniqueKeyVariants(report?.genomicAlterationsIdentified).map((v) => v.geneVariant) : null,
    matchedKbVariant: report?.kbMatches ? getUniqueKbVariants(report?.kbMatches).map((v) => v.kbVariant).join(', ') : null,
    matchedSmallMutation: report?.smallMutations ? getUniqueKbVariants(report?.smallMutations).map((v) => v.displayName).join(', ') : null,
    matchedStructuralVariant: report?.structuralVariants ? getUniqueKbVariants(report?.structuralVariants).map((v) => v.displayName).join(', ') : null,
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
