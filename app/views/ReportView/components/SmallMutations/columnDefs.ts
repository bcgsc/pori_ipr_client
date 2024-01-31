// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [{
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
  valueGetter: ({ data }) => data.chromosome && `${data.chromosome}:${data.startPosition}${data.endPosition && data.startPosition !== data.endPosition
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
  valueGetter: ({ data }) => `${data.refSeq}>${data.altSeq}`,
  hide: false,
}, {
  headerName: 'Copy Change',
  field: 'gene.copyVariants.copyChange',
  hide: false,
}, {
  headerName: 'LOH State',
  field: 'gene.copyVariants.lohState',
  hide: false,
},
{
  headerName: 'Alt/Total count DNA',
  valueGetter: ({ data }) => (
    data.tumourDepth !== null && data.tumourAltCount !== null
      ? `${data.tumourAltCount} / ${data.tumourDepth}`
      : ''
  ),
  hide: false,
},
{
  headerName: 'Alt/Total copies DNA',
  valueGetter: ({ data }) => (
    data.tumourAltCopies !== null && data.tumourRefCopies !== null
      ? `${data.tumourAltCopies} / ${data.tumourRefCopies + data.tumourAltCopies}`
      : ''
  ),
  hide: false,
},
{
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
  colId: 'rpkm',
  valueGetter: 'data.gene.expressionVariants.rpkm',
  hide: true,
}, {
  headerName: 'Expression (FC normal)',
  colId: 'primarySiteFoldChange',
  valueGetter: 'data.gene.expressionVariants.primarySiteFoldChange',
  hide: true,
}, {
  headerName: 'Primary Site Z-Score',
  colId: 'primarySiteZScore',
  valueGetter: 'data.gene.expressionVariants.primarySiteZScore',
  hide: true,
}, {
  headerName: 'Expression (TPM)',
  colId: 'tpm',
  valueGetter: 'data.gene.expressionVariants.tpm',
  hide: false,
}, {
  headerName: 'Expression (Perc Disease)',
  colId: 'diseasePercentile',
  valueGetter: 'data.gene.expressionVariants.diseasePercentile',
}, {
  headerName: 'Expression (kIQR)',
  colId: 'diseasekIQR',
  valueGetter: 'data.gene.expressionVariants.diseasekIQR',
  hide: true,
}, {
  headerName: 'Expression (Z-score)',
  colId: 'diseaseZScore',
  valueGetter: 'data.gene.expressionVariants.diseaseZScore',
  hide: false,
}, {
  headerName: 'Actions',
  colId: 'actions',
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
}];

const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex((obj) => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export {
  columnDefs,
  setHeaderName,
};
