const columnDefs = [{
  headerName: 'Gene',
  field: 'gene.name',
  hide: false,
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
}, {
  headerName: 'Transcript',
  field: 'transcript',
  hide: false,
}, {
  headerName: 'Protein Change',
  field: 'proteinChange',
  hide: false,
}, {
  headerName: 'Location',
  field: 'location',
  hide: false,
}, {
  headerName: 'Zygosity',
  field: 'zygosity',
  hide: false,
}, {
  headerName: 'Ref/Alt',
  field: 'refAlt',
  hide: false,
}, {
  headerName: 'Copy Change',
  field: 'gene.copyVariants.ploidyCorrCpChange',
  hide: false,
}, {
  headerName: 'LOH State',
  field: 'gene.copyVariants.lohState',
  hide: false,
}, {
  headerName: 'Ref/Alt DNA',
  field: 'tumourReads',
  hide: false,
}, {
  headerName: 'Ref/Alt RNA',
  field: 'rnaReads',
  hide: false,
}, {
  headerName: 'Expression (RPKM)',
  field: 'gene.expressionVariants.rpkm',
  hide: false,
}, {
  colId: 'foldChange',
  field: 'gene.expressionVariants.foldChange',
  hide: false,
}, {
  colId: 'tcgaPerc',
  field: 'gene.expressionVariants.tcgaPerc',
  hide: false,
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}, {
  headerName: 'Oncogene',
  colId: 'oncogene',
  valueGetter: 'data.gene.oncogene || false',
  hide: true,
}, {
  headerName: 'Tumour Suppressor Gene',
  colId: 'tumourSuppressor',
  valueGetter: 'data.gene.tumourSuppressor || false',
  hide: true,
}, {
  headerName: 'Cancer Related Gene',
  colId: 'cancerRelated',
  valueGetter: 'data.gene.cancerRelated || false',
  hide: true,
}, {
  headerName: 'Known Fusion Partner Gene',
  colId: 'knownFusionPartner',
  valueGetter: 'data.gene.knownFusionPartner || false',
  hide: true,
}, {
  headerName: 'Known Small Mutation Gene',
  colId: 'knownSmallMutation',
  valueGetter: 'data.gene.knownSmallMutation || false',
  hide: true,
}, {
  headerName: 'Therapeutic Associated Gene',
  colId: 'therapeuticAssociated',
  valueGetter: 'data.gene.therapeuticAssociated || false',
  hide: true,
}];

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const signatureColumnDefs = [
  {
    headerName: 'Signature',
    field: 'signature',
    hide: false,
    comparator: collator.compare,
    sort: 'asc',
    sortedAt: 1,
  },
  {
    headerName: 'NNLS',
    field: 'nnls',
    hide: false,
    sort: 'desc',
    sortedAt: 0,
  },
  {
    headerName: 'Proposed Association',
    field: 'associations',
    hide: false,
  },
  {
    headerName: 'Additional Features',
    field: 'features',
    hide: true,
  },
  {
    headerName: '# Cancer Types',
    field: 'numCancerTypes',
    hide: true,
  },
  {
    headerName: 'Significant Cancer Type',
    field: 'cancerTypes',
    hide: true,
  },
];

const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex(obj => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export {
  columnDefs,
  setHeaderName,
  signatureColumnDefs,
};
