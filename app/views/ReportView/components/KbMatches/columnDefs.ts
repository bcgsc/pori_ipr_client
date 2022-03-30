import ArrayCell from '@/components/DataTable/components/ArrayCellRenderer';
import getGeneProp from '@/utils/getGeneProp';

const columnDefs = [{
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
  hide: false,
  cellRendererFramework: ArrayCell('reference', true),
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
  headerName: 'Sample',
  field: 'sample',
  cellRendererFramework: ArrayCell('sample', false),
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
}];

const targetedColumnDefs = [{
  headerName: 'Gene',
  field: 'gene.name',
  cellRenderer: 'GeneCellRenderer',
  hide: false,
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
}];

export {
  columnDefs,
  targetedColumnDefs,
};
