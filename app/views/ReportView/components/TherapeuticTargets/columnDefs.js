const potentialTherapeuticTargetsColDefs = [{
  colId: 'drag',
  rowDrag: true,
  rowDragText: (params) => params.rowNode.data.gene,
  hide: true,
  pinned: 'left',
  suppressMenu: true,
  width: 40,
}, {
  headerName: 'Gene/Biomarker',
  field: 'gene',
  valueGetter: ({ data }) => {
    if (data.gene) {
      return `${data.gene}`;
    }
    return `${data.signature}`;
  },
  hide: false,
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
}, {
  headerName: 'Observed Variant',
  field: 'variant',
  hide: false,
}, {
  headerName: 'Therapy',
  field: 'therapy',
  hide: false,
}, {
  headerName: 'Context',
  field: 'context',
  hide: true,
}, {
  headerName: 'Evidence Level',
  headerComponent: 'headerCellRenderer',
  field: 'evidenceLevel',
  hide: false,
}, {
  headerName: 'Notes',
  field: 'notes',
  hide: false,
}, {
  colId: 'rank',
  field: 'rank',
  hide: true,
  sort: 'asc',
}, {
  headerName: 'Actions',
  colId: 'actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  sortable: false,
  suppressMenu: true,
}];

const potentialResistanceToxicityColDefs = potentialTherapeuticTargetsColDefs.map((col) => (col.field === 'context' ? { ...col, hide: false } : col));

export {
  potentialTherapeuticTargetsColDefs,
  potentialResistanceToxicityColDefs,
};
