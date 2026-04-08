import { ColDef, ValueGetterParams } from '@ag-grid-community/core';
import ArrayCell from '@/components/DataTable/components/ArrayCellRenderer';
import getGeneProp from '@/utils/getGeneProp';
import kbMStatementsGeneValueGetter from '@/utils/kbMatchStatementsGeneValueGetter';
import kbMatchStatementsKnownVarValueGetter from '@/utils/kbMatchStatementsKnownVarValueGetter';
import kbMatchStatementsObsVarValueGetter from '@/utils/kbMatchStatementsObsVarValueGetter';

const columnDefs: ColDef[] = [{
  headerName: 'Gene',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
  colId: 'gene',
  hide: false,
  valueGetter: kbMStatementsGeneValueGetter,
},
{
  headerName: 'Known Variant',
  colId: 'kbVariant',
  field: 'kbVariant',
  valueGetter: kbMatchStatementsKnownVarValueGetter,
  hide: false,
  maxWidth: 300,
},
{
  headerName: 'Observed Variant',
  colId: 'variant',
  hide: false,
  maxWidth: 300,
  valueGetter: kbMatchStatementsObsVarValueGetter,
},
{
  headerName: 'Cancer Type',
  colId: 'disease',
  field: 'disease',
  hide: false,
  cellRendererFramework: ArrayCell('disease'),
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
  cellRendererFramework: ArrayCell('context'),
  hide: false,
},
{
  headerName: 'PMID',
  colId: 'reference',
  field: 'reference',
  hide: false,
  cellRendererFramework: ArrayCell('reference', { isLink: true, allLinks: true }),
},
{
  headerName: 'Category',
  colId: 'category',
  field: 'category',
  cellRendererFramework: ArrayCell('category'),
  hide: true,
},
{
  headerName: 'Evidence Level',
  colId: 'evidenceLevel',
  field: 'evidenceLevel',
  cellRendererFramework: ArrayCell('evidenceLevel'),
  hide: false,
},
{
  headerName: 'IPR Evidence Level',
  colId: 'iprEvidenceLevel',
  field: 'iprEvidenceLevel',
  cellRendererFramework: ArrayCell('iprEvidenceLevel'),
  hide: false,
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
  headerName: 'Sample',
  field: 'sample',
  cellRendererFramework: ArrayCell('sample'),
  hide: false,
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
  valueGetter: (params: ValueGetterParams): string => {
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
  headerName: 'Actions',
  colId: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  hide: false,
  sortable: false,
  suppressMenu: true,
}];

export default columnDefs;
