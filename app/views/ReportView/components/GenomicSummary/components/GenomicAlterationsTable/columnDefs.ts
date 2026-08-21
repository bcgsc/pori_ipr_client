// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef, ColGroupDef } from '@ag-grid-community/core';
import { createGeneRelatedValueGetter } from '@/views/ReportView/components/StructuralVariants/columnDefs';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const smallMutationsColumnDefs: ColDef[] = [{
  headerName: 'Gene',
  field: 'gene.name',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
},
{
  headerName: 'Protein Change',
  field: 'proteinChange',
},
{
  headerName: 'Transcript',
  field: 'transcript',
},
{
  headerName: 'Location',
  field: 'location',
  valueGetter: ({ data }) => data.chromosome && `${data.chromosome}:${data.startPosition}${data.endPosition && data.startPosition !== data.endPosition
    ? `-${data.endPosition}`
    : ''
  }`,
},
{
  headerName: 'Zygosity',
  field: 'zygosity',
},
{
  headerName: 'VAF %',
  colId: 'tumourAltCount/tumourDepth',
  field: 'tumourAltCount/tumourDepth',
  valueGetter: ({
    data: {
      tumourAltCount, tumourDepth, rnaAltCount, rnaDepth,
    },
  }) => {
    if ((tumourAltCount && tumourDepth) || (tumourAltCount === 0 || tumourDepth === 0)) {
      return ((tumourAltCount / tumourDepth) * 100).toFixed(0);
    }
    if ((rnaAltCount && rnaDepth) || (rnaAltCount === 0 || rnaDepth === 0)) {
      return 'N/A (RNA)';
    }
    return '';
  },
  comparator: collator.compare,
},
{
  headerName: 'Actions',
  colId: 'actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

const copyNumberColumnDefs: ColDef[] = [{
  headerName: 'Gene',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
  field: 'gene.name',
},
{
  headerName: 'Copy Change',
  field: 'copyChange',
  valueFormatter: (params) => {
    if (params.value === null || params.value === undefined) return '';
    
    const num = Number(params.value);
    
    // If the number is greater than zero, prepend the "+" sign
    if (num > 0) {
      return `+${num}`;
    }
    // Zero or negative numbers will naturally format with their own sign or nothing
    return num.toString(); 
  },
},
{
  headerName: 'CNV State',
  field: 'cnvState',
},
{
  headerName: 'Chr:band',
  field: 'chromosomeBand',
},
{
  headerName: 'Actions',
  colId: 'actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

const structuralVariantsColumnDefs = [{
  headerName: 'Genes 5`::3`',
  colId: 'genes',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
  valueGetter: createGeneRelatedValueGetter('name', ' :: '),
},
{
  headerName: 'Exons 5`/3`',
  colId: 'exons',
  valueGetter: (params) => (params.data.exon1 && params.data.exon2
    ? `${params.data.exon1}:${params.data.exon2}`
    : (params.data.exon1 || params.data.exon2)),
},
{
  headerName: 'Breakpoint',
  colId: 'breakpoint',
  field: 'breakpoint',
},
{
  headerName: 'Event Type',
  colId: 'eventType',
  field: 'eventType',
},
{
  headerName: 'Sample',
  colId: 'detectedIn',
  field: 'detectedIn',
},
{
  headerName: 'Cytogenic Description',
  colId: 'conventionalName',
  field: 'conventionalName',
},
{
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  colId: 'actions',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

const expressionColumnDefs: Array<ColDef | ColGroupDef> = [{
  headerName: 'Gene',
  field: 'gene.name',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
},
{
  headerName: 'Expression Class',
  field: 'expressionState',
},
{
  headerName: 'Disease',
  children: [
    { headerName: 'Perc', field: 'diseasePercentile' },
    { headerName: 'Z-Score', field: 'diseaseZScore' },
  ],
},
{
  headerName: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  colId: 'actions',
  sortable: false,
  suppressMenu: true,
}];

export {
  smallMutationsColumnDefs,
  copyNumberColumnDefs,
  expressionColumnDefs,
  structuralVariantsColumnDefs,
};
