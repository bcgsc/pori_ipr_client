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
  headerName: 'Disease',
  children: [
    { headerName: 'Perc', field: 'diseasePercentile', hide: false },
    { headerName: 'kIQR', field: 'diseasekIQR', hide: false },
    { headerName: 'QC', field: 'diseaseQC', hide: false },
    { headerName: 'FC', field: 'diseaseFoldChange', hide: true },
    { headerName: 'Z-Score', field: 'diseaseZScore', hide: true },
  ],
}, {
  headerName: 'Normal Primary Site',
  children: [
    { headerName: 'FC', field: 'primarySiteFoldChange', hide: false },
    { headerName: 'Perc', field: 'primarySitePercentile', hide: false },
    { headerName: 'kIQR', field: 'primarySitekIQR', hide: false },
    { headerName: 'QC', field: 'primarySiteQC', hide: true },
    { headerName: 'Z-Score', field: 'primarySiteZScore', hide: true },
  ],
}, {
  headerName: 'Normal Biopsy Site',
  children: [
    { headerName: 'FC', field: 'biopsySiteFoldChange', hide: false },
    { headerName: 'Perc', field: 'biopsySitePercentile', hide: false },
    { headerName: 'kIQR', field: 'biopsySitekIQR', hide: false },
    { headerName: 'QC', field: 'biopsySiteQC', hide: true },
    { headerName: 'Z-Score', field: 'biopsySiteZScore', hide: true },
  ],
}, {
  headerName: 'RPKM',
  field: 'rpkm',
  hide: false,
}, {
  headerName: 'TPM',
  field: 'tpm',
  hide: true,
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
}, {
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

export default columnDefs;
