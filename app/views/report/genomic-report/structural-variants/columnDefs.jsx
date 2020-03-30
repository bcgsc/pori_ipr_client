import React from 'react';
import { Launch } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';

const columnDefs = [{
  headerName: 'Image',
  cellRendererFramework: function cellRendererFramework(params) {
    if (params.data.svg) {
      return (
        <IconButton size="small">
          <Launch size="small" />
        </IconButton>
      );
    }
    return null;
  },
  hide: false,
}, {
  headerName: 'Genes 5`::3`',
  colId: 'genes',
  valueGetter: params => `${params.data.gene1.name} :: ${params.data.gene2.name}`,
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
}];

export const setHeaderName = (header, colId) => {
  const index = columnDefs.findIndex(obj => obj.colId === colId);
  columnDefs[index].headerName = header;
};

export default columnDefs;
