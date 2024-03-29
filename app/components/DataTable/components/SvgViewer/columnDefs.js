const columnDefs = [{
  colId: 'geneHeader',
  children: [
    { headerName: 'Position', field: 'position' },
    { headerName: 'HGNC Gene', field: 'gene' },
  ],
}, {
  colId: 'ensemblHeader',
  children: [
    { headerName: 'Ensembl Gene', field: 'ensemblGene', cellRenderer: 'EnsemblCellRenderer' },
    { headerName: 'Ensembl Transcript', field: 'ensemblTranscript', cellRenderer: 'EnsemblCellRenderer' },
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
