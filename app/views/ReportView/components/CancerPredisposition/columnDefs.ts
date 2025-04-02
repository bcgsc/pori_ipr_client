import { ColDef, ValueGetterParams } from '@ag-grid-community/core';
import ArrayCell from '@/components/DataTable/components/ArrayCellRenderer';
import getGeneProp from '@/utils/getGeneProp';

const columnDefs: ColDef[] = [{
  headerName: 'Gene',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
  colId: 'gene',
  hide: false,
  valueGetter: (params: ValueGetterParams): string => {
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
  valueGetter: (params: ValueGetterParams): string => {
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
  headerName: 'Cancer Type',
  colId: 'disease',
  field: 'disease',
  hide: false,
  cellRendererFramework: ArrayCell('kbMatchedStatements.disease', false),
},
{
  headerName: 'Association',
  colId: 'relevance',
  field: 'relevance',
  cellRendererFramework: ArrayCell('kbMatchedStatements.relevance', false),
  hide: false,
},
{
  headerName: 'Context',
  colId: 'context',
  field: 'context',
  cellRendererFramework: ArrayCell('kbMatchedStatements.context', false),
  hide: false,
},
{
  headerName: 'PMID',
  colId: 'reference',
  field: 'reference',
  hide: false,
  cellRendererFramework: ArrayCell('kbMatchedStatements.reference', true),
},
{
  headerName: 'Category',
  colId: 'category',
  field: 'category',
  cellRendererFramework: ArrayCell('kbMatchedStatements.category', false),
  hide: true,
},
{
  headerName: 'Evidence Level',
  colId: 'evidenceLevel',
  field: 'evidenceLevel',
  cellRendererFramework: ArrayCell('kbMatchedStatements.evidenceLevel', false),
  hide: false,
},
{
  headerName: 'IPR Evidence Level',
  colId: 'iprEvidenceLevel',
  field: 'iprEvidenceLevel',
  cellRendererFramework: ArrayCell('kbMatchedStatements.iprEvidenceLevel', false),
  hide: false,
},
{
  headerName: 'Matched Cancer',
  field: 'matchedCancer',
  cellRendererFramework: ArrayCell('kbMatchedStatements.matchedCancer', false),
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
  cellRendererFramework: ArrayCell('kbMatchedStatements.sample', false),
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
