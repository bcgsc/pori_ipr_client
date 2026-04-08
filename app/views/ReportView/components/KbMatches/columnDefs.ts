import ArrayCell from '@/components/DataTable/components/ArrayCellRenderer';
import getGeneProp from '@/utils/getGeneProp';
import kbMStatementsGeneValueGetter from '@/utils/kbMatchStatementsGeneValueGetter';
import kbMatchStatementsKnownVarValueGetter from '@/utils/kbMatchStatementsKnownVarValueGetter';
import kbMatchStatementsObsVarValueGetter from '@/utils/kbMatchStatementsObsVarValueGetter';
import { ColDef } from '@ag-grid-community/core';
import { basicTooltipValueGetter } from '@/components/DataTable/components/ToolTip';
import kbMatchStatementsFlagValueGetter from '@/utils/kbMatchStatementsFlagValueGetter';

const columnDefs: ColDef[] = [
  {
    headerName: 'Gene',
    cellRenderer: 'GeneCellRenderer',
    cellRendererParams: { link: true },
    colId: 'gene',
    hide: false,
    valueGetter: kbMStatementsGeneValueGetter,
    sort: 'asc',
  },
  {
    headerName: 'Known Variants',
    colId: 'kbVariant',
    valueGetter: kbMatchStatementsKnownVarValueGetter,
    hide: false,
    tooltipComponent: 'ToolTip',
    tooltipValueGetter: basicTooltipValueGetter,
  },
  {
    headerName: 'Observed Variants',
    colId: 'variant',
    valueGetter: kbMatchStatementsObsVarValueGetter,
    hide: false,
    tooltipComponent: 'ToolTip',
    tooltipValueGetter: basicTooltipValueGetter,
  },
  {
    headerName: 'Flags',
    colId: 'flags',
    valueGetter: kbMatchStatementsFlagValueGetter,
    hide: false,
    tooltipComponent: 'ToolTip',
    tooltipValueGetter: basicTooltipValueGetter,
  },
  {
    headerName: 'Cancer Type',
    colId: 'disease',
    field: 'disease',
    hide: false,
    cellRendererFramework: ArrayCell('disease'),
    tooltipComponent: 'ToolTip',
    tooltipValueGetter: basicTooltipValueGetter,
  },
  {
    headerName: 'IPR Evidence Level',
    colId: 'iprEvidenceLevel',
    field: 'iprEvidenceLevel',
    cellRendererFramework: ArrayCell('iprEvidenceLevel'),
    hide: false,
  },
  {
    headerName: 'Association',
    colId: 'relevance',
    field: 'relevance',
    cellRendererFramework: ArrayCell('relevance'),
    hide: false,
  },
  {
    headerName: 'Context',
    colId: 'context',
    field: 'context',
    hide: false,
    initialWidth: 300,
    suppressAutoSize: true,
    autoHeight: true,
    wrapText: true,
    tooltipComponent: 'ToolTip',
    tooltipValueGetter: basicTooltipValueGetter,
  },
  {
    headerName: 'Reference',
    colId: 'reference',
    field: 'reference',
    valueGetter: (params) => {
      const { data: { externalSource, externalStatementId, reference } } = params;
      if (externalSource === 'clinicaltrials.gov' && /^nct\d+$/.test(externalStatementId)) {
        return externalStatementId.toUpperCase();
      }
      if (Array.isArray(reference) && reference.length > 0) {
        reference[0] = /^nct\d+$/.test(reference[0]) ? reference[0].toUpperCase() : reference[0];
      }
      return reference;
    },
    cellRendererFramework: ArrayCell('reference', { isLink: true, useValue: true, allLinks: true }),
    hide: false,
    autoHeight: true,
    wrapText: true,
    initialWidth: 300,
    suppressAutoSize: true,
    tooltipComponent: 'ToolTip',
    tooltipValueGetter: basicTooltipValueGetter,
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
    headerName: 'Evidence Level',
    colId: 'evidenceLevel',
    field: 'evidenceLevel',
    cellRendererFramework: ArrayCell('evidenceLevel'),
    hide: false,
  },
  {
    headerName: 'Category',
    colId: 'category',
    field: 'category',
    cellRendererFramework: ArrayCell('category'),
    hide: true,
  },
  {
    headerName: 'Matched Cancer',
    field: 'matchedCancer',
    cellRendererFramework: ArrayCell('matchedCancer'),
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
      return variant?.zygosity;
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
