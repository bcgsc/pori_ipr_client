import ArrayCell from '../../../../components/DataTable/components/ArrayCellRenderer';

const getGeneProp = (params, property) => {
  const { data: { variant, variantType } } = params;
  if (variantType === 'sv') {
    return variant.gene1[property] || variant.gene2[property] || false;
  }
  return variant.gene[property] || false;
};

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
  headerName: 'Disease Percentile',
  colId: 'diseasePercentile',
  hide: true,
  valueGetter: (params) => {
    const { data: { variant, variantType } } = params;
    if (variantType === 'exp') {
      return variant.tcgaPerc;
    }
    if (variantType === 'sv') {
      return `${variant.gene1.expressionVariants.tcgaPerc} / ${variant.gene2.expressionVariants.tcgaPerc}`;
    }
    return `${variant.gene.expressionVariants.tcgaPerc}`;
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
  headerName: 'PMID',
  colId: 'reference',
  field: 'reference',
  hide: false,
  cellRendererFramework: ArrayCell('reference', true),
},
{
  headerName: 'LOH Region',
  colId: 'LOHRegion',
  hide: true,
  valueGetter: (params) => {
    const { data: { variant, variantType } } = params;
    if (variantType === 'cnv') {
      return variant.lohState;
    }
    if (variantType === 'sv') {
      return `${variant.gene1.copyVariants.lohState} / ${variant.gene2.copyVariants.lohState}`;
    }
    return `${variant.gene.copyVariants.lohState}`;
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
  headerName: 'Copy Number',
  colId: 'copyNumber',
  hide: true,
  valueGetter: (params) => {
    const { data: { variant, variantType } } = params;
    if (variantType === 'cnv') {
      return variant.ploidyCorrCpChange;
    }
    if (variantType === 'sv') {
      return `${variant.gene1.copyVariants.ploidyCorrCpChange} / ${variant.gene2.copyVariants.ploidyCorrCpChange}`;
    }
    return `${variant.gene.copyVariants.ploidyCorrCpChange}`;
  },
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
  valueGetter: params => getGeneProp(params, 'oncogene'),
  hide: true,
}, {
  headerName: 'Tumour Suppressor',
  colId: 'tumourSuppressor',
  valueGetter: params => getGeneProp(params, 'tumourSuppressor'),
  hide: true,
}, {
  headerName: 'Cancer Related',
  colId: 'cancerRelated',
  valueGetter: params => getGeneProp(params, 'cancerRelated'),
  hide: true,
}, {
  headerName: 'Known Fusion Partner',
  colId: 'knownFusionPartner',
  valueGetter: params => getGeneProp(params, 'knownFusionPartner'),
  hide: true,
}, {
  headerName: 'Known Small Mutation',
  colId: 'knownSmallMutation',
  valueGetter: params => getGeneProp(params, 'knownSmallMutation'),
  hide: true,
}, {
  headerName: 'Therapeutic Associated',
  colId: 'therapeuticAssociated',
  valueGetter: params => getGeneProp(params, 'therapeuticAssociated'),
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
