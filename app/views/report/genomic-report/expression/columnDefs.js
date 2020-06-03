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
    { headerName: 'Perc', field: 'gtexPerc', hide: false },
    { headerName: 'kIQR', field: 'gtexkIQR', hide: false },
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
  valueGetter: 'data.gene.oncogene || false',
  hide: true,
}, {
  headerName: 'Tumour Suppressor',
  colId: 'tumourSuppressor',
  valueGetter: 'data.gene.tumourSuppressor || false',
  hide: true,
}, {
  headerName: 'Cancer Related',
  colId: 'cancerRelated',
  valueGetter: 'data.gene.cancerRelated || false',
  hide: true,
}, {
  headerName: 'Known Fusion Partner',
  colId: 'knownFusionPartner',
  valueGetter: 'data.gene.knownFusionPartner || false',
  hide: true,
}, {
  headerName: 'Known Small Mutation',
  colId: 'knownSmallMutation',
  valueGetter: 'data.gene.knownSmallMutation || false',
  hide: true,
}, {
  headerName: 'Therapeutic Associated Gene',
  colId: 'therapeuticAssociated',
  valueGetter: 'data.gene.therapeuticAssociated || false',
  hide: true,
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

export default columnDefs;
