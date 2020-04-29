import ArrayCell from '../../../../components/DataTable/components/ArrayCellRenderer';

const columnDefs = [{
  headerName: 'Gene',
  cellRenderer: 'GeneCellRenderer',
  colId: 'gene',
  hide: false,
  valueGetter: (params) => {
    const { data: { variant } } = params;

    if (variant.gene) {
      return variant.gene.name;
    }
    return `${variant.gene1.name}, ${variant.gene2.name}`;
  },
},
{
  headerName: 'Known Variant',
  colId: 'kbVariant',
  field: 'kbVariant',
  hide: false,
},
{
  headerName: 'Observed Variant',
  colId: 'variant',
  hide: false,
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
    return `${variant.gene.name} ${variant.expression_class}`;
  },
},
{
  headerName: 'Cancer Type',
  colId: 'disease',
  hide: false,
  cellRendererFramework: ArrayCell('disease', false),
  valueGetter: (params) => {
    if (typeof params.data.disease === 'object') {
      const diseaseString = [...params.data.disease].sort().toString();
      return diseaseString;
    }
    return params.data.disease;
  },
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
  hide: false,
},
{
  headerName: 'Context',
  colId: 'context',
  field: 'context',
  hide: false,
},
{
  headerName: 'PMID',
  colId: 'reference',
  hide: false,
  cellRendererFramework: ArrayCell('reference', true),
  valueGetter: (params) => {
    if (typeof params.data.reference === 'object') {
      const referenceString = [...params.data.reference].sort().toString();
      return referenceString;
    }
    return params.data.reference;
  },
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
  hide: false,
},
{
  headerName: 'Matched Cancer',
  field: 'matchedCancer',
  hide: true,
},
{
  headerName: 'Sample',
  field: 'sample',
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
