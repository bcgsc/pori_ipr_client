const testData1 = [
  {
    tumourAltCount: 3,
    tumourRefCount: 147,
    tumourDepth: 150,
    rnaAltCount: 4,
    rnaRefCount: 305,
    rnaDepth: 309,
    normalAltCount: null,
    normalRefCount: null,
    normalDepth: null,
    hgvsProtein: 'EGFR:p.L833V',
    hgvsCds: 'EGFR:c.2497T>G',
    hgvsGenomic: 'chr7:g.55191746T>G',
    tumourAltCopies: null,
    tumourRefCopies: null,
    library: null,
    ident: 'test-ident',
    kbMatches: [
      {
        kbMatchedStatements: [
          {
            relevance: 'sensitivity',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-A',
          },
        ],
      },
      {
        kbMatchedStatements: [
          {
            relevance: 'sensitivity',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-A',
          },
        ],
      },
      {
        kbMatchedStatements: [
          {
            relevance: 'reactive',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-B',
          },
        ],
      },
      {
        kbMatchedStatements: [
          {
            relevance: 'reactive',
            context: 'cabozantinib [DB08875]',
            iprEvidenceLevel: 'IPR-B',
          },
        ],
      },
      {
        kbMatchedStatements: [
          {
            relevance: 'sensitivity',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-B',
          },
        ],
      },
      {
        kbMatchedStatements: [
          {
            relevance: 'sensitivity',
            context: 'cabozantinib [DB08875]',
            iprEvidenceLevel: 'IPR-B',
          },
        ],
      },
      {
        kbMatchedStatements: [
          {
            relevance: 'reactive',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-A',
          },
        ],
      },
      {
        kbMatchedStatements: [
          {
            relevance: 'reactive',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-A',
          },
        ],
      },
    ],
  },
];

export {
  testData1,
};
