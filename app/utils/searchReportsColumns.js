import startCase from '@/utils/startCase';

function searchReportsColumns(report, analyst, reviewer, bioinformatician, searchCategory) {
  return {
    matchedVariant: searchCategory === 'kbVariant' ? report?.kbMatches[0]?.kbVariant : report?.genomicAlterationsIdentified[0]?.geneVariant,
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
