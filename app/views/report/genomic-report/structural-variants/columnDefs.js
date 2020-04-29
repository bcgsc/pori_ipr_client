const columnDefs = [{
  headerName: 'Genes 5`::3`',
  colId: 'genes',
  cellRenderer: 'GeneCellRenderer',
  valueGetter: (params) => {
    const { data } = params;

    return data.gene1.name && data.gene2.name
      ? `${data.gene1.name}, ${data.gene2.name}`
      : data.gene1.name || data.gene2.name;
  },
  hide: false,
}, {
  headerName: 'Exons 5`/3`',
  colId: 'exons',
  valueGetter: params => `${params.data.exon1}:${params.data.exon2}`,
  hide: false,
}, {
  headerName: 'Breakpoint',
  field: 'breakpoint',
  hide: false,
}, {
  headerName: 'Event Type',
  field: 'eventType',
  hide: false,
}, {
  headerName: 'Sample',
  field: 'detectedIn',
  hide: false,
}, {
  headerName: 'Cytogenic Description',
  field: 'conventionalName',
  hide: false,
}, {
  headerName: 'RPKM 5`/3`',
  colId: 'rpkm',
  valueGetter: params => `${params.data.gene1.expressionVariants.rpkm}/${params.data.gene2.expressionVariants.rpkm}`,
  hide: false,
}, {
  colId: 'foldChange',
  valueGetter: params => `${params.data.gene1.expressionVariants.foldChange}/${params.data.gene2.expressionVariants.foldChange}`,
  hide: false,
}, {
  colId: 'tcgaPerc',
  valueGetter: params => `${params.data.gene1.expressionVariants.tcgaPerc}/${params.data.gene2.expressionVariants.tcgaPerc}`,
  hide: false,
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
