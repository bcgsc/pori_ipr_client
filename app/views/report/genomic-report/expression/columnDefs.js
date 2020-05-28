const columnDefs = [{
  headerName: 'Gene',
  field: 'gene.name',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
  hide: false,
}, {
  headerName: 'Expression Class',
  field: 'expressionState',
  hide: false,
}, {
  headerName: 'Copy State',
  field: 'gene.copyVariants.cnvState',
  hide: false,
}, {
  headerName: 'Normal Tissue',
  children: [
    { headerName: 'FC', field: 'foldChange', hide: false },
    { headerName: 'Perc', field: 'tcgaNormPerc', hide: false },
    { headerName: 'kIQR', field: 'tcgaNormkIQR', hide: false },
  ],
}, {
  headerName: 'Disease Tissue',
  children: [
    { headerName: 'Perc', field: 'tcgaPerc', hide: false },
    { headerName: 'kIQR', field: 'tcgakIQR', hide: false },
    { headerName: 'QC', field: 'tcgaQC', hide: false },
  ],
}, {
  headerName: 'Protein',
  children: [
    { headerName: 'Perc', field: 'ptxPerc', hide: true },
    { headerName: 'kIQR', field: 'ptxkIQR', hide: true },
    { headerName: 'QC', field: 'ptxQC', hide: true },
  ],
}, {
  headerName: 'Oncogene',
  colId: 'oncogene',
  field: 'gene.oncogene',
  hide: true,
}, {
  headerName: 'Tumour Suppressor',
  colId: 'tumourSuppressor',
  field: 'gene.tumourSuppressor',
  hide: true,
}, {
  headerName: 'Cancer Related',
  colId: 'cancerRelated',
  field: 'gene.cancerRelated',
  hide: true,
}, {
  headerName: 'Known Fusion Partner',
  colId: 'knownFusionPartner',
  field: 'gene.knownFusionPartner',
  hide: true,
}, {
  headerName: 'Known Small Mutation',
  colId: 'knownSmallMutation',
  field: 'gene.knownSmallMutation',
  hide: true,
}, {
  headerName: 'Therapeutic Associated Gene',
  colId: 'therapeuticAssociated',
  field: 'gene.therapeuticAssociated',
  hide: true,
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

export default columnDefs;
