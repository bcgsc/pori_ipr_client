import ArrayCell from '@/components/DataTable/components/ArrayCellRenderer';
import getGeneProp from '@/utils/getGeneProp';

const sampleColumnDefs = [
  {
    headerName: 'Sample',
    field: 'Sample',
    colId: 'Sample',
    hide: false,
  },
  {
    headerName: 'Sample Name',
    field: 'Sample Name',
    colId: 'Sample Name',
    hide: false,
  },
  {
    headerName: 'Collection Date',
    field: 'Collection Date',
    colId: 'Collection Date',
    hide: false,
  },
  {
    headerName: 'Primary Site',
    field: 'Primary Site',
    colId: 'Primary Site',
    hide: false,
  },
  {
    headerName: 'Biopsy Site',
    field: 'Biopsy Site',
    colId: 'Biopsy Site',
    hide: false,
  },
  {
    headerName: 'Pathology Estimated Tumour Content',
    field: 'Patho TC',
    colId: 'Patho TC',
    hide: false,
  },
];

const pharmacoGenomicPrintColumnDefs = [
  {
    headerName: 'Gene',
    colId: 'gene',
    hide: false,
    valueGetter: (params) => {
      const { data: { variant } } = params;

      if (variant.gene) {
        return variant.gene.name;
      }
      return variant.gene1.name && variant.gene2.name
        ? `${variant.gene1.name}, ${variant.gene2.name}`
        : variant.gene1.name || variant.gene2.name;
    },
  },
  {
    headerName: 'Known Variant',
    colId: 'kbVariant',
    field: 'kbVariant',
    hide: false,
    maxWidth: 300,
  },
  {
    headerName: 'Observed Variant',
    colId: 'variant',
    hide: false,
    maxWidth: 300,
    valueGetter: (params) => {
      const { data: { variant, variantType } } = params;

      if (variantType === 'cnv') {
        return `${variant.gene.name} ${variant.cnvState}`;
      }
      if (variantType === 'sv') {
        return `(${variant.gene1.name || '?'
          },${variant.gene2.name || '?'
          }):fusion(e.${variant.exon1 || '?'
          },e.${variant.exon2 || '?'
          })`;
      }
      if (variantType === 'mut') {
        return `${variant.gene.name}:${variant.proteinChange}`;
      }
      return `${variant.gene.name} ${variant.expressionState}`;
    },
  },
  {
    headerName: 'Alt/Ref',
    colId: 'Alt/Ref',
    // headerValueGetter: (params) => {
    //   const { variant } = params;
    //   if (variant?.germline) {
    //     return ''
    //   }
    //   return 'Alt/Ref';
    // },
    valueGetter: (params) => {
      const { variant } = params;
      let refText = variant.tumourRefCount ?? variant.rnaRefCount;
      let altText = variant.tumourAltCount ?? variant.rnaAltCount;
      if (variant?.germline) {
        refText = variant.normalRefCount;
        altText = variant.normalAltCount;
      }
      return `${refText}/${altText}`;
    },
  },
];

const pharmacoGenomicColumnDefs = [
  {
    headerName: 'Gene',
    cellRenderer: 'GeneCellRenderer',
    cellRendererParams: { link: true },
    colId: 'gene',
    hide: false,
    valueGetter: (params) => {
      const { data: { variant } } = params;

      if (variant.gene) {
        return variant.gene.name;
      }
      return variant.gene1.name && variant.gene2.name
        ? `${variant.gene1.name}, ${variant.gene2.name}`
        : variant.gene1.name || variant.gene2.name;
    },
  },
  {
    headerName: 'Known Variant',
    colId: 'kbVariant',
    field: 'kbVariant',
    cellRendererFramework: ArrayCell('kbVariant', false),
    hide: false,
    maxWidth: 300,
  },
  {
    headerName: 'Observed Variant',
    colId: 'variant',
    hide: false,
    maxWidth: 300,
    valueGetter: (params) => {
      const { data: { variant, variantType } } = params;

      if (variantType === 'cnv') {
        return `${variant.gene.name} ${variant.cnvState}`;
      }
      if (variantType === 'sv') {
        return `(${variant.gene1.name || '?'
          },${variant.gene2.name || '?'
          }):fusion(e.${variant.exon1 || '?'
          },e.${variant.exon2 || '?'
          })`;
      }
      if (variantType === 'mut') {
        return `${variant.gene.name}:${variant.proteinChange}`;
      }
      return `${variant.gene.name} ${variant.expressionState}`;
    },
  },
  {
    headerName: 'Association',
    colId: 'relevance',
    field: 'relevance',
    cellRendererFramework: ArrayCell('relevance', false),
    hide: false,
  },
  {
    headerName: 'Context',
    colId: 'context',
    field: 'context',
    cellRendererFramework: ArrayCell('context', false),
    hide: false,
  },
  {
    headerName: 'Category',
    colId: 'category',
    field: 'category',
    cellRendererFramework: ArrayCell('category', false),
    hide: true,
  },
  {
    headerName: 'Evidence Level',
    colId: 'evidenceLevel',
    field: 'evidenceLevel',
    cellRendererFramework: ArrayCell('evidenceLevel', false),
    hide: false,
  },
  {
    headerName: 'Matched Cancer',
    field: 'matchedCancer',
    cellRendererFramework: ArrayCell('matchedCancer', false),
    hide: true,
  },
  {
    headerName: 'Inferred',
    field: 'inferred',
    valueGetter: 'data.inferred || false',
    hide: true,
  },
  {
    headerName: 'Review Status',
    field: 'reviewStatus',
    hide: true,
  },
  {
    headerName: 'Zygosity',
    colId: 'zygosity',
    hide: true,
    valueGetter: (params) => {
      const { data: { variant } } = params;
      return variant.zygosity;
    },
  }, {
    headerName: 'Oncogene',
    colId: 'oncogene',
    valueGetter: (params) => getGeneProp(params, 'oncogene'),
    hide: true,
  }, {
    headerName: 'Tumour Suppressor Gene',
    colId: 'tumourSuppressor',
    valueGetter: (params) => getGeneProp(params, 'tumourSuppressor'),
    hide: true,
  }, {
    headerName: 'Cancer Related Gene',
    colId: 'cancerRelated',
    valueGetter: (params) => getGeneProp(params, 'cancerRelated'),
    hide: true,
  }, {
    headerName: 'Known Fusion Partner Gene',
    colId: 'knownFusionPartner',
    valueGetter: (params) => getGeneProp(params, 'knownFusionPartner'),
    hide: true,
  }, {
    headerName: 'Known Small Mutation Gene',
    colId: 'knownSmallMutation',
    valueGetter: (params) => getGeneProp(params, 'knownSmallMutation'),
    hide: true,
  }, {
    headerName: 'Therapeutic Associated Gene',
    colId: 'therapeuticAssociated',
    valueGetter: (params) => getGeneProp(params, 'therapeuticAssociated'),
    hide: true,
  }, {
    headerName: 'HGVS CDS',
    field: 'variant.hgvsCds',
    hide: false,
  }, {
    headerName: 'Protein Change',
    field: 'variant.proteinChange',
    hide: false,
  }, {
    headerName: 'External Source',
    colId: 'externalSource',
    cellRenderer: 'CivicCellRenderer',
    hide: false,
  }, {
    headerName: 'External Statement ID',
    field: 'externalStatementId',
    hide: true,
  }, {
    headerName: 'Actions',
    colId: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    hide: false,
    sortable: false,
    suppressMenu: true,
  },
];

const cancerPredisPrintColumnDefs = [];
const cancerPredisColumnDefs = [
  {
    colId: "gene'",
  },
  {
    headerName: 'Known Variant',
  },
  {
    headerName: 'Observed Variant (DNA)',
  },
  {
    headerName: 'Observed Variant (Protein)',
  },
  {
    headerName: 'Alt/Ref',
  },
  {
    headerName: 'association',
  },
  {
    colId: 'context',
  },
  {
    colId: 'evidence',
  },
];

export {
  sampleColumnDefs,
  pharmacoGenomicColumnDefs,
  pharmacoGenomicPrintColumnDefs,
};
