import ArrayCell from '@/components/DataTable/components/ArrayCellRenderer';
import getGeneProp from '@/utils/getGeneProp';
import { ColDef } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  {
    headerName: 'Gene',
    cellRenderer: 'GeneCellRenderer',
    cellRendererParams: { link: true },
    colId: 'gene',
    hide: false,
    valueGetter: (params) => {
      const { data: { kbMatches } } = params;
      if (kbMatches) {
        const kbMatch = kbMatches[0];
        // msi and tmb doesn't have gene field
        if (kbMatch.variantType === 'msi' || kbMatch.variantType === 'tmb') {
          return '';
        }
        if (kbMatch.variant.gene) {
          return kbMatch.variant.gene.name;
        }
        return kbMatch.variant.gene1.name && kbMatch.variant.gene2.name
          ? `${kbMatch.variant.gene1.name}, ${kbMatch.variant.gene2.name}`
          : kbMatch.variant.gene1.name || kbMatch.variant.gene2.name;
      }
    },
    sort: 'asc',
  },
  {
    headerName: 'Known Variant',
    colId: 'kbVariant',
    valueGetter: (params) => {
      const { data: { kbMatches } } = params;

      if (kbMatches) {
        const kbMatch = kbMatches[0];
        if (kbMatch.kbVariant) {
          return kbMatch.kbVariant;
        }
      }
    },
    cellRendererFramework: ArrayCell('kbMatches', false),
    hide: false,
    maxWidth: 300,
  },
  {
    headerName: 'Observed Variant',
    colId: 'variant',
    field: 'variant',
    cellRendererFramework: ArrayCell('variant', false),
    hide: false,
    maxWidth: 300,
  },
  {
    headerName: 'Cancer Type',
    colId: 'disease',
    field: 'disease',
    hide: false,
    cellRendererFramework: ArrayCell('disease', false),
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
    headerName: 'PMID',
    colId: 'reference',
    field: 'reference',
    cellRendererFramework: ArrayCell('reference', true),
    hide: false,
  },
  {
    headerName: 'Recruitment Status',
    hide: false,
    valueGetter: (params) => {
      const { data: { relevance, kbData } } = params;
      if (kbData?.recruitment_status) {
        if (relevance === 'eligibility') {
          return `${kbData.recruitment_status}`;
        }
        return 'N/A';
      }
      return '';
    },
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
    headerName: 'IPR Evidence Level',
    colId: 'iprEvidenceLevel',
    field: 'iprEvidenceLevel',
    cellRendererFramework: ArrayCell('iprEvidenceLevel', false),
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
    headerName: 'In Knowledgebase Gene',
    colId: 'kbStatementRelated',
    valueGetter: (params) => getGeneProp(params, 'kbStatementRelated'),
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
    cellRenderer: 'KbMatchesActionCellRenderer',
    pinned: 'right',
    hide: false,
    sortable: false,
    suppressMenu: true,
  }];

  const targetedColumnDefs = [{
    headerName: 'Gene',
    field: 'gene.name',
    cellRenderer: 'GeneCellRenderer',
    hide: false,
    sort: 'asc',
  },
  {
    headerName: 'Variant',
    field: 'variant',
    hide: false,
  },
  {
    headerName: 'Source',
    field: 'sample',
    hide: false,
  },
];

export {
  columnDefs,
  targetedColumnDefs,
};
