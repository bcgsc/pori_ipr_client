const createGeneRelatedValueGetter = (field, delimiter = ' / ', subfield = '') => ({ data }) => {
  try {
    let attr1 = data.gene1[field];
    let attr2 = data.gene2[field];
    if (subfield) {
      attr1 = attr1[subfield];
      attr2 = attr2[subfield];
    }
    if (attr1 !== undefined && attr2 !== undefined && attr1 !== null && attr2 !== null) {
      return `${attr1}${delimiter}${attr2}`;
    } if (attr1 !== undefined && attr1 !== null) {
      return attr1;
    }
    return attr2;
  } catch (err) {
    return null;
  }
};

const columnDefs = [{
  headerName: 'Genes 5`::3`',
  colId: 'genes',
  cellRenderer: 'GeneCellRenderer',
  cellRendererParams: { link: true },
  valueGetter: createGeneRelatedValueGetter('name', ' :: '),
  hide: false,
}, {
  headerName: 'Exons 5`/3`',
  colId: 'exons',
  valueGetter: (params) => (params.data.exon1 && params.data.exon2
    ? `${params.data.exon1}:${params.data.exon2}`
    : (params.data.exon1 || params.data.exon2)),
  hide: false,
}, {
  headerName: 'Breakpoint',
  colId: 'breakpoint',
  field: 'breakpoint',
  hide: false,
}, {
  headerName: 'Event Type',
  colId: 'eventType',
  field: 'eventType',
  hide: false,
}, {
  headerName: 'Sample',
  colId: 'detectedIn',
  field: 'detectedIn',
  hide: false,
}, {
  headerName: 'Cytogenic Description',
  colId: 'conventionalName',
  field: 'conventionalName',
  hide: false,
}, {
  headerName: 'Expression (RPKM) 5`/3`',
  colId: 'rpkm',
  valueGetter: createGeneRelatedValueGetter('expressionVariants', ' / ', 'rpkm'),
  hide: false,
}, {
  headerName: 'Expression (normal FC) 5`/3`',
  colId: 'primarySiteFoldChange',
  valueGetter: createGeneRelatedValueGetter('expressionVariants', ' / ', 'primarySiteFoldChange'),
  hide: false,
}, {
  headerName: 'Expression (Perc) 5`/3`',
  colId: 'diseasePercentile',
  valueGetter: createGeneRelatedValueGetter('expressionVariants', ' / ', 'diseasePercentile'),
  hide: false,
}, {
  headerName: 'Oncogene',
  colId: 'oncogene',
  valueGetter: (params) => (params.data.gene1.oncogene || params.data.gene2.oncogene || false),
  hide: true,
}, {
  headerName: 'Tumour Suppressor Gene',
  colId: 'tumourSuppressor',
  valueGetter: (params) => (params.data.gene1.tumourSuppressor || params.data.gene2.tumourSuppressor || false),
  hide: true,
}, {
  headerName: 'Cancer Related Gene',
  colId: 'cancerRelated',
  valueGetter: (params) => (params.data.gene1.cancerRelated || params.data.gene2.cancerRelated || false),
  hide: true,
}, {
  headerName: 'Known Fusion Partner Gene',
  colId: 'knownFusionPartner',
  valueGetter: (params) => (params.data.gene1.knownFusionPartner || params.data.gene2.knownFusionPartner || false),
  hide: true,
}, {
  headerName: 'Known Small Mutation Gene',
  colId: 'knownSmallMutation',
  valueGetter: (params) => (params.data.gene1.knownSmallMutation || params.data.gene2.knownSmallMutation || false),
  hide: true,
}, {
  headerName: 'Therapeutic Associated Gene',
  colId: 'therapeuticAssociated',
  valueGetter: (params) => (params.data.gene1.therapeuticAssociated || params.data.gene2.therapeuticAssociated || false),
  hide: true,
}, {
  headerName: 'High Quality',
  colId: 'highQuality',
  valueGetter: 'data.highQuality || false',
  hide: true,
}, {
  headerName: 'Actions',
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
