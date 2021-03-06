const columnDefs = [{
  headerName: 'Gene',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
  field: 'gene.name',
  hide: false,
}, {
  headerName: 'Copy Change',
  field: 'copyChange',
  hide: false,
}, {
  headerName: 'LOH State',
  field: 'lohState',
  hide: false,
}, {
  headerName: 'CNV State',
  field: 'cnvState',
  hide: false,
}, {
  headerName: 'Chr:band',
  field: 'chromosomeBand',
  hide: false,
}, {
  headerName: 'CNV Start',
  field: 'start',
  hide: false,
}, {
  headerName: 'CNV End',
  field: 'end',
  hide: false,
}, {
  headerName: 'Size (Mb)',
  field: 'size',
  hide: false,
}, {
  headerName: 'Expression (RPKM)',
  field: 'gene.expressionVariants.rpkm',
  hide: false,
}, {
  headerName: 'Expression (Normal FC)',
  colId: 'primarySiteFoldChange',
  field: 'gene.expressionVariants.primarySiteFoldChange',
  hide: false,
}, {
  headerName: 'Expression (Perc)',
  colId: 'diseasePercentile',
  field: 'gene.expressionVariants.diseasePercentile',
  hide: false,
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
  colId: 'actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

export const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex((obj) => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export default columnDefs;
