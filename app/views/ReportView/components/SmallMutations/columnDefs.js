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
  valueGetter: ({data}) => data.chromosome && `${data.chromosome}:${data.startPosition}${
    data.endPosition && data.startPosition !== data.endPosition
      ? `-${data.endPosition}`
      : ''
    }`,
  hide: false,
}, {
  headerName: 'Zygosity',
  field: 'zygosity',
  hide: false,
}, {
  headerName: 'Ref/Alt',
  valueGetter: ({data}) => `${data.refSeq}>${data.altSeq}`,
  hide: false,
}, {
  headerName: 'Copy Change',
  field: 'gene.copyVariants.copyChange',
  hide: false,
}, {
  headerName: 'LOH State',
  field: 'gene.copyVariants.lohState',
  hide: false,
}, {
  headerName: 'Ref/Alt DNA',
  valueGetter: ({data}) => `${data.tumourRefCount} / ${data.tumourAltCount}`,
  hide: false,
}, {
  headerName: 'HGVSp',
  field: 'hgvsProtein',
  hide: true,
}, {
  headerName: 'HGVSc',
  field: 'hgvsCds',
  hide: true,
}, {
  headerName: 'HGVSg',
  field: 'hgvsGenomic',
  hide: true,
}, {
  headerName: 'Expression (RPKM)',
  field: 'gene.expressionVariants.rpkm',
  hide: false,
}, {
  headerName: 'Expression (FC normal)',
  colId: 'foldChange',
  field: 'gene.expressionVariants.primarySiteFoldChange',
  hide: false,
}, {
  headerName: 'Expression (Perc Disease)',
  colId: 'diseasePercentile',
  field: 'gene.expressionVariants.diseasePercentile',
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

const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex(obj => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export {
  columnDefs,
  setHeaderName,
};
