const columnDefs = [{
  colId: 'geneHeader',
  children: [
    { headerName: 'Position', field: 'position' },
    { headerName: 'HGNC Gene', field: 'gene' },
  ],
}, {
  colId: 'ensemblHeader',
  children: [
    { headerName: 'Ensembl Gene', field: 'ensemblGene', cellRenderer: 'LinkCellRenderer' },
    { headerName: 'Ensembl Transcript', field: 'ensemblTranscript', cellRenderer: 'LinkCellRenderer' },
  ],
}, {
  colId: 'predictedHeader',
  children: [
    { headerName: 'Exon', field: 'exon' },
    { headerName: 'Breakpoint', field: 'breakpoint' },
  ],
}];

export const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex((obj) => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export default columnDefs;
