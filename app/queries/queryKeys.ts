// AUTO-GENERATED — DO NOT EDIT

export const queryKeys = {
  user: {
    all: () => ['user'] as const,

    user: (userIdent) => ['user', userIdent] as const,
    me: () => ['user', 'me'] as const,
    settings: () => ['user', 'settings'] as const,
    search: () => ['user', 'search'] as const,
    group: () => ['user', 'group'] as const,
    groupGroup: (groupIdent) => ['user', 'group', groupIdent] as const,
    groupGroupMember: (groupIdent) => ['user', 'group', groupIdent, 'member'] as const,
  },

  reports: {
    all: () => ['reports'] as const,

    reportPatientInformation: (reportIdent) => ['reports', reportIdent, 'patient-information'] as const,
    reportMutationBurden: (reportIdent) => ['reports', reportIdent, 'mutation-burden'] as const,
    reportMutationBurdenBurden: (reportIdent, burdenIdent) => ['reports', reportIdent, 'mutation-burden', burdenIdent] as const,
    reportTmburMutationBurden: (reportIdent) => ['reports', reportIdent, 'tmbur-mutation-burden'] as const,
    reportSummaryVariantCounts: (reportIdent) => ['reports', reportIdent, 'summary', 'variant-counts'] as const,
    reportSummaryGenomicAlterationsIdentified: (reportIdent) => ['reports', reportIdent, 'summary', 'genomic-alterations-identified'] as const,
    reportSummaryGenomicAlterationsIdentifiedAlteration: (reportIdent, alterationIdent) => ['reports', reportIdent, 'summary', 'genomic-alterations-identified', alterationIdent] as const,
    schema: () => ['reports', 'schema'] as const,
    report: (reportIdent) => ['reports', reportIdent] as const,
    reportUser: (reportIdent) => ['reports', reportIdent, 'user'] as const,
    reportUserBinding: (reportIdent, bindingIdent) => ['reports', reportIdent, 'user', bindingIdent] as const,
    reportSummaryMicrobial: (reportIdent) => ['reports', reportIdent, 'summary', 'microbial'] as const,
    reportTherapeuticTargets: (reportIdent) => ['reports', reportIdent, 'therapeutic-targets'] as const,
    reportTherapeuticTargetsTherapeuticTarget: (reportIdent, therapeuticTargetIdent) => ['reports', reportIdent, 'therapeutic-targets', therapeuticTargetIdent] as const,
    reportSummaryPathwayAnalysis: (reportIdent) => ['reports', reportIdent, 'summary', 'pathway-analysis'] as const,
    reportAppendices: (reportIdent) => ['reports', reportIdent, 'appendices'] as const,
    reportAppendicesTcga: (reportIdent) => ['reports', reportIdent, 'appendices', 'tcga'] as const,
    reportCopyVariants: (reportIdent) => ['reports', reportIdent, 'copy-variants'] as const,
    reportCopyVariantsCnv: (reportIdent, cnvIdent) => ['reports', reportIdent, 'copy-variants', cnvIdent] as const,
    reportProteinVariants: (reportIdent) => ['reports', reportIdent, 'protein-variants'] as const,
    reportProteinVariantsProtein: (reportIdent, proteinIdent) => ['reports', reportIdent, 'protein-variants', proteinIdent] as const,
    reportExpressionVariants: (reportIdent) => ['reports', reportIdent, 'expression-variants'] as const,
    reportExpressionVariantsExpression: (reportIdent, expressionIdent) => ['reports', reportIdent, 'expression-variants', expressionIdent] as const,
    reportGenes: (reportIdent) => ['reports', reportIdent, 'genes'] as const,
    reportGenesGeneName: (reportIdent, geneNameIdent) => ['reports', reportIdent, 'genes', geneNameIdent] as const,
    reportGeneViewerGeneName: (reportIdent, geneNameIdent) => ['reports', reportIdent, 'gene-viewer', geneNameIdent] as const,
    reportImage: (reportIdent) => ['reports', reportIdent, 'image'] as const,
    reportImageImage: (reportIdent, imageIdent) => ['reports', reportIdent, 'image', imageIdent] as const,
    reportImageRetrieveKey: (reportIdent, keyIdent) => ['reports', reportIdent, 'image', 'retrieve', keyIdent] as const,
    reportImageSubtypePlots: (reportIdent) => ['reports', reportIdent, 'image', 'subtype-plots'] as const,
    reportImageMutationBurden: (reportIdent) => ['reports', reportIdent, 'image', 'mutation-burden'] as const,
    reportImageExpressionDensityGraphs: (reportIdent) => ['reports', reportIdent, 'image', 'expression-density-graphs'] as const,
    reportKbMatches: (reportIdent) => ['reports', reportIdent, 'kb-matches'] as const,
    reportKbMatchesKbMatch: (reportIdent, kbMatchIdent) => ['reports', reportIdent, 'kb-matches', kbMatchIdent] as const,
    reportKbMatchesKbMatchedStatements: (reportIdent) => ['reports', reportIdent, 'kb-matches', 'kb-matched-statements'] as const,
    reportKbMatchesKbMatchedStatementsKbMatchedStatement: (reportIdent, kbMatchedStatementIdent) => ['reports', reportIdent, 'kb-matches', 'kb-matched-statements', kbMatchedStatementIdent] as const,
    reportMavis: (reportIdent) => ['reports', reportIdent, 'mavis'] as const,
    reportMutationSignatures: (reportIdent) => ['reports', reportIdent, 'mutation-signatures'] as const,
    reportMutationSignaturesMutationSignature: (reportIdent, mutationSignatureIdent) => ['reports', reportIdent, 'mutation-signatures', mutationSignatureIdent] as const,
    reportPresentationDiscussion: (reportIdent) => ['reports', reportIdent, 'presentation', 'discussion'] as const,
    reportPresentationDiscussionDiscussion: (reportIdent, discussionIdent) => ['reports', reportIdent, 'presentation', 'discussion', discussionIdent] as const,
    reportPresentationSlide: (reportIdent) => ['reports', reportIdent, 'presentation', 'slide'] as const,
    reportPresentationSlideSlide: (reportIdent, slideIdent) => ['reports', reportIdent, 'presentation', 'slide', slideIdent] as const,
    reportSampleInfo: (reportIdent) => ['reports', reportIdent, 'sample-info'] as const,
    reportSampleInfoSampleInfo: (reportIdent, sampleInfoIdent) => ['reports', reportIdent, 'sample-info', sampleInfoIdent] as const,
    reportProbeResults: (reportIdent) => ['reports', reportIdent, 'probe-results'] as const,
    reportProbeResultsTarget: (reportIdent, targetIdent) => ['reports', reportIdent, 'probe-results', targetIdent] as const,
    reportProbeTestInformation: (reportIdent) => ['reports', reportIdent, 'probe-test-information'] as const,
    reportSignatures: (reportIdent) => ['reports', reportIdent, 'signatures'] as const,
    reportSignaturesSignRole: (reportIdent, roleIdent) => ['reports', reportIdent, 'signatures', 'sign', roleIdent] as const,
    reportSignaturesRevokeRole: (reportIdent, roleIdent) => ['reports', reportIdent, 'signatures', 'revoke', roleIdent] as const,
    reportSignaturesEarliestSignoff: (reportIdent) => ['reports', reportIdent, 'signatures', 'earliest-signoff'] as const,
    reportSmallMutations: (reportIdent) => ['reports', reportIdent, 'small-mutations'] as const,
    reportSmallMutationsMutation: (reportIdent, mutationIdent) => ['reports', reportIdent, 'small-mutations', mutationIdent] as const,
    reportStructuralVariants: (reportIdent) => ['reports', reportIdent, 'structural-variants'] as const,
    reportStructuralVariantsStructuralVariant: (reportIdent, structuralVariantIdent) => ['reports', reportIdent, 'structural-variants', structuralVariantIdent] as const,
    reportSignatureVariants: (reportIdent) => ['reports', reportIdent, 'signature-variants'] as const,
    reportSignatureVariantsSignatureVariant: (reportIdent, signatureVariantIdent) => ['reports', reportIdent, 'signature-variants', signatureVariantIdent] as const,
    reportSummaryAnalystComments: (reportIdent) => ['reports', reportIdent, 'summary', 'analyst-comments'] as const,
    reportComparators: (reportIdent) => ['reports', reportIdent, 'comparators'] as const,
    reportMsi: (reportIdent) => ['reports', reportIdent, 'msi'] as const,
    reportMsiMsi: (reportIdent, msiIdent) => ['reports', reportIdent, 'msi', msiIdent] as const,
    reportImmuneCellTypes: (reportIdent) => ['reports', reportIdent, 'immune-cell-types'] as const,
    reportImmuneCellTypesImmuneCellTypes: (reportIdent, immuneCellTypesIdent) => ['reports', reportIdent, 'immune-cell-types', immuneCellTypesIdent] as const,
    reportVariants: (reportIdent) => ['reports', reportIdent, 'variants'] as const,
    reportSetSummaryTable: (reportIdent) => ['reports', reportIdent, 'set-summary-table'] as const,
    reportSetStatementSummaryTable: (reportIdent) => ['reports', reportIdent, 'set-statement-summary-table'] as const,
    reportObservedVariantAnnotations: (reportIdent) => ['reports', reportIdent, 'observed-variant-annotations'] as const,
    reportObservedVariantAnnotationsObservedVariantAnnotation: (reportIdent, observedVariantAnnotationIdent) => ['reports', reportIdent, 'observed-variant-annotations', observedVariantAnnotationIdent] as const,
    reportStateHistory: (reportIdent) => ['reports', reportIdent, 'state-history'] as const,
    reportHlaTypes: (reportIdent) => ['reports', reportIdent, 'hla-types'] as const,
    reportHlaTypesHlaType: (reportIdent, hlaTypeIdent) => ['reports', reportIdent, 'hla-types', hlaTypeIdent] as const,
  },

  reportsAsync: {
    all: () => ['reports-async'] as const,

    report: (reportIdent) => ['reports-async', reportIdent] as const,
  },

  project: {
    all: () => ['project'] as const,

    projectReports: (projectIdent) => ['project', projectIdent, 'reports'] as const,
    projectTherapeuticTargets: (projectIdent) => ['project', projectIdent, 'therapeutic-targets'] as const,
  },

  germlineSmallMutationReports: {
    all: () => ['germline-small-mutation-reports'] as const,

    germline: (germlineIdent) => ['germline-small-mutation-reports', germlineIdent] as const,
    germlineReviews: (germlineIdent) => ['germline-small-mutation-reports', germlineIdent, 'reviews'] as const,
    germlineReviewsReview: (germlineIdent, reviewIdent) => ['germline-small-mutation-reports', germlineIdent, 'reviews', reviewIdent] as const,
    germlineVariants: (germlineIdent) => ['germline-small-mutation-reports', germlineIdent, 'variants'] as const,
    germlineVariantsVariant: (germlineIdent, variantIdent) => ['germline-small-mutation-reports', germlineIdent, 'variants', variantIdent] as const,
    germlineUsers: (germlineIdent) => ['germline-small-mutation-reports', germlineIdent, 'users'] as const,
    germlineUsersBinding: (germlineIdent, bindingIdent) => ['germline-small-mutation-reports', germlineIdent, 'users', bindingIdent] as const,
  },

  graphkb: {
    all: () => ['graphkb'] as const,

    targetType: (targetTypeIdent) => ['graphkb', targetTypeIdent] as const,
    evidenceLevels: () => ['graphkb', 'evidence-levels'] as const,
  },

  variantText: {
    all: () => ['variant-text'] as const,

    variantText: (variantTextIdent) => ['variant-text', variantTextIdent] as const,
  },

  templates: {
    all: () => ['templates'] as const,

    template: (templateIdent) => ['templates', templateIdent] as const,
    templateAppendix: (templateIdent) => ['templates', templateIdent, 'appendix'] as const,
    templateSignatureTypes: (templateIdent) => ['templates', templateIdent, 'signature-types'] as const,
  },

  notification: {
    all: () => ['notification'] as const,

    notifications: () => ['notification', 'notifications'] as const,
  },

};
