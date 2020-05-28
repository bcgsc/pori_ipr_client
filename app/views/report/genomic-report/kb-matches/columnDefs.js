import ArrayCell from '../../../../components/DataTable/components/ArrayCellRenderer';

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
      return `(${
        variant.gene1.name || '?'
      },${
        variant.gene2.name || '?'
      }):fusion(e.${
        variant.exon1 || '?'
      },e.${
        variant.exon2 || '?'
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
  headerName: 'Evidence',
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
  headerName: 'Sample',
  field: 'sample',
  cellRendererFramework: ArrayCell('sample', false),
  hide: false,
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
  valueGetter: (params) => {
    const { data: { variant, variantType } } = params;
    if (variantType === 'sv') {
      return variant.gene1.oncogene || variant.gene2.oncogene;
    }
    return variant.gene.oncogene;
  },
  hide: true,
}, {
  headerName: 'Tumour Suppressor',
  colId: 'tumourSuppressor',
  valueGetter: (params) => {
    const { data: { variant, variantType } } = params;
    if (variantType === 'sv') {
      return variant.gene1.tumourSuppressor || variant.gene2.tumourSuppressor;
    }
    return variant.gene.tumourSuppressor;
  },
  hide: true,
}, {
  headerName: 'Cancer Related',
  colId: 'cancerRelated',
  valueGetter: (params) => {
    const { data: { variant, variantType } } = params;
    if (variantType === 'sv') {
      return variant.gene1.cancerRelated || variant.gene2.cancerRelated;
    }
    return variant.gene.cancerRelated;
  },
  hide: true,
}, {
  headerName: 'Known Fusion Partner',
  colId: 'knownFusionPartner',
  valueGetter: (params) => {
    const { data: { variant, variantType } } = params;
    if (variantType === 'sv') {
      return variant.gene1.knownFusionPartner || variant.gene2.knownFusionPartner;
    }
    return `${variant.gene.knownFusionPartner}`;
  },
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
