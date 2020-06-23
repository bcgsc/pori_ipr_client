const columnDefs = [{
  headerName: 'Genes 5`::3`',
  colId: 'genes',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
  valueGetter: params => (params.data.gene1.name && params.data.gene2.name
    ? `${params.data.gene1.name} :: ${params.data.gene2.name}`
    : (params.data.gene1.name || params.data.gene2.name)),
  hide: false,
}, {
  headerName: 'Exons 5`/3`',
  colId: 'exons',
  valueGetter: params => (params.data.exon1 && params.data.exon2
    ? `${params.data.exon1}:${params.data.exon2}`
    : (params.data.exon1 || params.data.exon2)),
  hide: false,
}, {
  headerName: 'Breakpoint',
  colId: 'breakpoint',
  field: 'breakpoint',
  hide: false,
}, {
  headerName: 'Event Type',
  colId: 'eventType',
  field: 'eventType',
  hide: false,
}, {
  headerName: 'Sample',
  colId: 'detectedIn',
  field: 'detectedIn',
  hide: false,
}, {
  headerName: 'Cytogenic Description',
  colId: 'conventionalName',
  field: 'conventionalName',
  hide: false,
}, {
  headerName: 'RPKM 5`/3`',
  colId: 'rpkm',
  valueGetter: params => (
    params.data.gene1.expressionVariants.rpkm && params.data.gene2.expressionVariants.rpkm
      ? `${params.data.gene1.expressionVariants.rpkm}/${params.data.gene2.expressionVariants.rpkm}`
      : (params.data.gene1.expressionVariants.rpkm || params.data.gene2.expressionVariants.rpkm)
  ),
  hide: false,
}, {
  colId: 'foldChange',
  valueGetter: params => (
    params.data.gene1.expressionVariants.foldChange && params.data.gene2.expressionVariants.foldChange
      ? `${params.data.gene1.expressionVariants.foldChange}/${params.data.gene2.expressionVariants.foldChange}`
      : (params.data.gene1.expressionVariants.foldChange || params.data.gene2.expressionVariants.foldChange)
  ),
  hide: false,
}, {
  colId: 'tcgaPerc',
  valueGetter: params => (
    params.data.gene1.expressionVariants.tcgaPerc && params.data.gene2.expressionVariants.tcgaPerc
      ? `${params.data.gene1.expressionVariants.tcgaPerc}/${params.data.gene2.expressionVariants.tcgaPerc}`
      : (params.data.gene1.expressionVariants.tcgaPerc || params.data.gene2.expressionVariants.tcgaPerc)
  ),
  hide: false,
}, {
  headerName: 'Oncogene',
  colId: 'oncogene',
  valueGetter: params => (params.data.gene1.oncogene || params.data.gene2.oncogene || false),
  hide: true,
}, {
  headerName: 'Tumour Suppressor Gene',
  colId: 'tumourSuppressor',
  valueGetter: params => (params.data.gene1.tumourSuppressor || params.data.gene2.tumourSuppressor || false),
  hide: true,
}, {
  headerName: 'Cancer Related Gene',
  colId: 'cancerRelated',
  valueGetter: params => (params.data.gene1.cancerRelated || params.data.gene2.cancerRelated || false),
  hide: true,
}, {
  headerName: 'Known Fusion Partner Gene',
  colId: 'knownFusionPartner',
  valueGetter: params => (params.data.gene1.knownFusionPartner || params.data.gene2.knownFusionPartner || false),
  hide: true,
}, {
  headerName: 'Known Small Mutation Gene',
  colId: 'knownSmallMutation',
  valueGetter: params => (params.data.gene1.knownSmallMutation || params.data.gene2.knownSmallMutation || false),
  hide: true,
}, {
  headerName: 'Therapeutic Associated Gene',
  colId: 'therapeuticAssociated',
  valueGetter: params => (params.data.gene1.therapeuticAssociated || params.data.gene2.therapeuticAssociated || false),
  hide: true,
}, {
  headerName: 'High Quality',
  colId: 'highQuality',
  valueGetter: 'data.highQuality || false',
  hide: true,
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

export const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex(obj => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export default columnDefs;
