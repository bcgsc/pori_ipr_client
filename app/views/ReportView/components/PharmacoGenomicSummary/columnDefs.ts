import ArrayCell, { getNestedValue } from '@/components/DataTable/components/ArrayCellRenderer';
import getGeneProp from '@/utils/getGeneProp';
import { sampleColumnDefs } from '../../common';

const COMMON_COL_DEFS = [
  {
    headerName: 'Gene',
    colId: 'gene',
    field: 'gene',
    hide: false,
    minWidth: 70,
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
    hide: true,
    maxWidth: 300,
  },
  {
    headerName: 'Observed Variant (DNA)',
    colId: 'variant',
    field: 'variant',
    hide: false,
    maxWidth: 300,
    width: 130,
    valueGetter: (params) => {
      const { data: { variant: { hgvsCds, hgvsGenomic } } } = params;
      return `${hgvsCds ?? hgvsGenomic}`;
    },
  },
  {
    headerName: 'Observed Variant (protein)',
    colId: 'variant.hgvsProtein',
    field: 'variant.hgvsProtein',
    valueGetter: ({ data }) => data?.variant?.hgvsProtein,
    hide: false,
    minWidth: 190,
    maxWidth: 300,
  },
  {
    headerName: 'Alt/Total',
    colId: 'Alt/Total',
    field: 'Alt/Total',
    valueGetter: (params) => {
      const { data: { variant } } = params;
      let totalText = variant.rnaDepth;
      let altText = variant.rnaAltCount;

      if (variant.tumourDepth !== null && variant.tumourAltCount !== null) {
        totalText = variant.tumourDepth;
        altText = variant.tumourAltCount;
      }

      if (variant?.germline) {
        totalText = variant.normalDepth;
        altText = variant.normalAltCount;
      }
      return (altText && totalText) ? `${altText}/${totalText}` : '';
    },
  },
  {
    headerName: 'Association',
    colId: 'kbMatchedStatements.relevance',
    minWidth: 90,
    // ValueGetter is for mostly PrintTable, as ArrayCell has a different way of obtaining value
    valueGetter: ({ data }) => getNestedValue(data, 'kbMatchedStatements.relevance'),
    cellRendererFramework: ArrayCell('kbMatchedStatements.relevance'),
  },
];

const ACTIONS_COL_DEF = {
  headerName: 'Actions',
  colId: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  hide: false,
  sortable: false,
  suppressMenu: true,
};

const pharmacoGenomicPrintColumnDefs = [
  ...COMMON_COL_DEFS,
  {
    headerName: 'Therapy',
    colId: 'context',
    field: 'context',
    valueGetter: ({ data }) => getNestedValue(data, 'kbMatchedStatements.context'),
  },
  {
    headerName: 'Evidence',
    colId: 'evidenceLevel',
    field: 'evidenceLevel',
    valueGetter: ({ data }) => getNestedValue(data, 'kbMatchedStatements.evidenceLevel'),
  },
  {
    headerName: 'External Source',
    colId: 'externalSource',
    field: 'externalSource',
    valueGetter: ({ data }) => getNestedValue(data, 'kbMatchedStatements.externalSource'),
  },
];

const pharmacoGenomicColumnDefs = [
  ...COMMON_COL_DEFS,
  {
    minWidth: 90,
    headerName: 'Therapy',
    colId: 'context',
    field: 'context',
    cellRendererFramework: ArrayCell('kbMatchedStatements.context'),
  },
  {
    headerName: 'Evidence',
    colId: 'evidenceLevel',
    field: 'evidenceLevel',
    minWidth: 90,
    valueGetter: ({ data }) => getNestedValue(data, 'kbMatchedStatements.evidenceLevel'),
  },
  {
    headerName: 'External Source',
    colId: 'externalSource',
    cellRendererFramework: ArrayCell('kbMatchedStatements.externalSource'),
    minWidth: 110,
  },
  {
    headerName: 'External Statement ID',
    field: 'externalStatementId',
    cellRendererFramework: ArrayCell('kbMatchedStatements.externalStatementId'),
    hide: true,
  },
  {
    headerName: 'Context',
    colId: 'context',
    field: 'context',
    cellRendererFramework: ArrayCell('kbMatchedStatements.context'),
    hide: true,
  },
  {
    headerName: 'Category',
    colId: 'category',
    field: 'category',
    cellRendererFramework: ArrayCell('kbMatchedStatements.category'),
    hide: true,
  },
  {
    headerName: 'Matched Cancer',
    field: 'matchedCancer',
    cellRendererFramework: ArrayCell('kbMatchedStatements.matchedCancer'),
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
    cellRendererFramework: ArrayCell('kbMatchedStatements.reviewStatus'),
    hide: true,
  },
  {
    headerName: 'Zygosity',
    colId: 'zygosity',
    hide: true,
    valueGetter: ({ data }) => getNestedValue(data, 'kbMatches.variant.zygosity'),
  },
  {
    headerName: 'Oncogene',
    colId: 'oncogene',
    valueGetter: (params) => getGeneProp(params, 'oncogene'),
    hide: true,
  },
  {
    headerName: 'Tumour Suppressor Gene',
    colId: 'tumourSuppressor',
    valueGetter: (params) => getGeneProp(params, 'tumourSuppressor'),
    hide: true,
  },
  {
    headerName: 'In Knowledgebase Gene',
    colId: 'kbStatementRelated',
    valueGetter: (params) => getGeneProp(params, 'kbStatementRelated'),
    hide: true,
  },
  {
    headerName: 'Known Fusion Partner Gene',
    colId: 'knownFusionPartner',
    valueGetter: (params) => getGeneProp(params, 'knownFusionPartner'),
    hide: true,
  },
  {
    headerName: 'Known Small Mutation Gene',
    colId: 'knownSmallMutation',
    valueGetter: (params) => getGeneProp(params, 'knownSmallMutation'),
    hide: true,
  },
  {
    headerName: 'Therapeutic Associated Gene',
    colId: 'therapeuticAssociated',
    valueGetter: (params) => getGeneProp(params, 'therapeuticAssociated'),
    hide: true,
  },
  {
    headerName: 'HGVS CDS',
    field: 'variant.hgvsCds',
    hide: true,
  },
  {
    headerName: 'Protein Change',
    field: 'variant.proteinChange',
    hide: true,
  },
  ACTIONS_COL_DEF,
];

const cancerPredisPrintColumnDefs = [
  ...COMMON_COL_DEFS,
  {
    headerName: 'Context',
    field: 'context',
    colId: 'context',
  },
  {
    headerName: 'Source',
    field: 'externalSource',
    colId: 'externalSource',
  },
];
const cancerPredisColumnDefs = [
  ...COMMON_COL_DEFS,
  {
    field: 'context',
  },
  {
    headerName: 'Source',
    field: 'externalSource',
    minWidth: 90,
  },
  ACTIONS_COL_DEF,
];

export {
  sampleColumnDefs,
  pharmacoGenomicColumnDefs,
  pharmacoGenomicPrintColumnDefs,
  cancerPredisPrintColumnDefs,
  cancerPredisColumnDefs,
};
