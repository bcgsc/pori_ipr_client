// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [{
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
  colId: 'rpkm',
  valueGetter: 'data.gene.expressionVariants.rpkm',
  hide: true,
}, {
  headerName: 'Expression (Normal FC)',
  colId: 'primarySiteFoldChange',
  valueGetter: 'data.gene.expressionVariants.primarySiteFoldChange',
  hide: true,
}, {
  headerName: 'Expression (Perc)',
  colId: 'diseasePercentile',
  valueGetter: 'data.gene.expressionVariants.diseasePercentile',
  hide: false,
}, {
  headerName: 'Expression (TPM)',
  colId: 'tpm',
  valueGetter: 'data.gene.expressionVariants.tpm',
  hide: false,
}, {
  headerName: 'Expression (kIQR)',
  colId: 'diseasekIQR',
  valueGetter: 'data.gene.expressionVariants.diseasekIQR',
  hide: true,
}, {
  headerName: 'Expression (Zscore)',
  colId: 'diseaseZScore',
  valueGetter: 'data.gene.expressionVariants.diseaseZScore',
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
  headerName: 'In Knowledgebase Gene',
  colId: 'kbStatementRelated',
  valueGetter: 'data.gene.kbStatementRelated || false',
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
