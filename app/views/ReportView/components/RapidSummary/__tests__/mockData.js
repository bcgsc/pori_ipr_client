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
        ident: 'kbMatchId-1',
        kbMatchedStatements: [
          {
            relevance: 'sensitivity',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-A',
            ident: 'sensitivity-afatinib[DB08916]-IPR-A',
          },
        ],
      },
      {
        ident: 'kbMatchId-2',
        kbMatchedStatements: [
          {
            relevance: 'sensitivity',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-A',
            ident: 'sensitivity-afatinib[DB08916]-IPR-A',
          },
        ],
      },
      {
        ident: 'kbMatchId-3',
        kbMatchedStatements: [
          {
            relevance: 'reactive',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-B',
            ident: 'reactive-afatinib[DB08916]-IPR-B',
          },
        ],
      },
      {
        ident: 'kbMatchId-4',
        kbMatchedStatements: [
          {
            relevance: 'reactive',
            context: 'cabozantinib [DB08875]',
            iprEvidenceLevel: 'IPR-B',
            ident: 'reactive-cabozantinib[DB08875]-IPR-B',
          },
        ],
      },
      {
        ident: 'kbMatchId-5',
        kbMatchedStatements: [
          {
            relevance: 'sensitivity',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-B',
            ident: 'sensitivity-afatinib[DB08916]-IPR-B',
          },
        ],
      },
      {
        ident: 'kbMatchId-6',
        kbMatchedStatements: [
          {
            relevance: 'sensitivity',
            context: 'cabozantinib [DB08875]',
            iprEvidenceLevel: 'IPR-B',
            ident: 'sensitivity-cabozantinib[DB08875]-IPR-B',
          },
        ],
      },
      {
        ident: 'kbMatchId-7',
        kbMatchedStatements: [
          {
            relevance: 'reactive',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-A',
            ident: 'reactive-afatinib[DB08916]-IPR-A',
          },
        ],
      },
      {
        ident: 'kbMatchId-8',
        kbMatchedStatements: [
          {
            relevance: 'reactive',
            context: 'afatinib [DB08916]',
            iprEvidenceLevel: 'IPR-A',
            ident: 'reactive-afatinib[DB08916]-IPR-A',
          },
        ],
      },
    ],
  },
];

export {
  testData1,
};
