// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef, ColGroupDef } from '@ag-grid-community/core';

const columnDefs: Array<ColDef | ColGroupDef> = [{
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
    { headerName: 'kIQR', field: 'diseasekIQR', hide: true },
    { headerName: 'QC', field: 'diseaseQC', hide: false },
    { headerName: 'FC', field: 'diseaseFoldChange', hide: true },
    { headerName: 'Z-Score', field: 'diseaseZScore', hide: false },
  ],
},
{
  headerName: 'Primary Site',
  children: [
    { headerName: 'FC', field: 'primarySiteFoldChange', hide: true },
    { headerName: 'Perc', field: 'primarySitePercentile', hide: false },
    { headerName: 'kIQR', field: 'primarySitekIQR', hide: true },
    { headerName: 'QC', field: 'primarySiteQC', hide: true },
    { headerName: 'Z-Score', field: 'primarySiteZScore', hide: false },
  ],
},
{
  headerName: 'Biopsy Site',
  children: [
    { headerName: 'FC', field: 'biopsySiteFoldChange', hide: true },
    { headerName: 'Perc', field: 'biopsySitePercentile', hide: false },
    { headerName: 'kIQR', field: 'biopsySitekIQR', hide: true },
    { headerName: 'QC', field: 'biopsySiteQC', hide: true },
    { headerName: 'Z-Score', field: 'biopsySiteZScore', hide: false },
  ],
},
{
  headerName: 'Internal Pancancer',
  children: [
    { headerName: 'FC', field: 'internalPancancerFoldChange', hide: true },
    { headerName: 'Perc', field: 'internalPancancerPercentile', hide: false },
    { headerName: 'kIQR', field: 'internalPancancerkIQR', hide: true },
    { headerName: 'QC', field: 'internalPancancerQC', hide: true },
    { headerName: 'Z-Score', field: 'internalPancancerZScore', hide: false },
  ],
},
{
  headerName: 'RPKM',
  field: 'rpkm',
  hide: true,
}, {
  headerName: 'TPM',
  field: 'tpm',
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
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  colId: 'actions',
  sortable: false,
  suppressMenu: true,
}];

export default columnDefs;
