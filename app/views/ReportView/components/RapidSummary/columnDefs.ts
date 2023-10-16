/**
 * @param row KbMatch data
 * @returns correct genomic event to be displayed
 */
const getGenomicEvent = ({ data }) => {
  const {
    gene, proteinChange, variantType, kbCategory, displayName,
  } = data;
  if (displayName) {
    return displayName;
  }

  if (variantType === 'cnv') {
    const { cnvState } = data;
    return `${gene.name} ${cnvState}`;
  }

  if (variantType === 'sv') {
    const {
      gene1, gene2, exon1, exon2,
    } = data;
    return `(${gene1.name || '?'
    },${gene2.name || '?'
    }):fusion(e.${exon1 || '?'
    },e.${exon2 || '?'
    })`;
  }

  if (variantType === 'msi' || variantType === 'tmb') {
    return kbCategory;
  }

  if (variantType === 'mut') {
    return `${gene.name}:${proteinChange}`;
  }

  const { hgvsProtein, hgvsCds, hgvsGenomic } = data;
  if (hgvsProtein) { return hgvsProtein; }
  if (hgvsCds) { return hgvsCds; }
  return hgvsGenomic;
};

const ACTIONS_COLDEF = {
  headerName: 'Actions',
  colId: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  hide: false,
  sortable: false,
  suppressMenu: true,
  minWidth: 88,
};

const therapeuticAssociationColDefs = [
  {
    headerName: 'Genomic Events',
    colId: 'genomicEvents',
    field: 'genomicEvents',
    valueGetter: getGenomicEvent,
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour)',
    colId: 'Alt/Total (Tumour)',
    field: 'Alt/Total (Tumour)',
    valueGetter: ({
      data: {
        tumourAltCount, tumourDepth, rnaAltCount, rnaDepth,
      },
    }) => {
      if ((tumourAltCount && tumourDepth) || (tumourAltCount === 0 || tumourDepth === 0)) {
        return `${tumourAltCount}/${tumourDepth}`;
      }
      if ((rnaAltCount && rnaDepth) || (rnaAltCount === 0 || rnaDepth === 0)) {
        return `${rnaAltCount}/${rnaDepth}`;
      }
      return '';
    },
    hide: false,
  },
  {
    headerName: 'VAF %',
    field: 'tumourAltCount/tumourDepth',
    colId: 'tumourAltCount/tumourDepth',
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
    hide: false,
  },
  {
    headerName: 'Comments',
    field: 'comments',
    hide: false,
  },
  {
    headerName: 'Potential Clinical Association',
    colId: 'potentialClinicalAssociation',
    field: 'potentialClinicalAssociation',
    hide: false,
  },
  {
    ...ACTIONS_COLDEF,
  },
];

const cancerRelevanceColDefs = [
  {
    headerName: 'Genomic Events',
    colId: 'genomicEvents',
    field: 'genomicEvents',
    valueGetter: getGenomicEvent,
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour)',
    colId: 'Alt/Total (Tumour)',
    field: 'Alt/Total (Tumour)',
    valueGetter: ({
      data: {
        tumourAltCount, tumourDepth, rnaAltCount, rnaDepth,
      },
    }) => {
      if ((tumourAltCount && tumourDepth) || (tumourAltCount === 0 || tumourDepth === 0)) {
        return `${tumourAltCount}/${tumourDepth}`;
      }
      if ((rnaAltCount && rnaDepth) || (rnaAltCount === 0 || rnaDepth === 0)) {
        return `${rnaAltCount}/${rnaDepth}`;
      }
      return '';
    },
    hide: false,
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
    hide: false,
  },
  {
    headerName: 'Comments',
    field: 'comments',
    hide: false,
  },
  {
    ...ACTIONS_COLDEF,
  },
];

const sampleColumnDefs = [
  {
    headerName: 'Display Name',
    field: 'displayName',
    hide: false,
  },
  {
    headerName: 'Genomic Events',
    colId: 'genomicEvents',
    field: 'genomicEvents',
    valueGetter: getGenomicEvent,
    hide: false,
  },
  {
    headerName: 'Sample',
    colId: 'Sample',
    field: 'Sample',
    hide: false,
  },
  {
    headerName: 'Sample Name',
    colId: 'Sample Name',
    field: 'Sample Name',
    hide: false,
  },
  {
    headerName: 'Collection Date',
    colId: 'Collection Date',
    field: 'Collection Date',
    hide: false,
  },
  {
    headerName: 'Primary Site',
    colId: 'Primary Site',
    field: 'Primary Site',
    hide: false,
  },
  {
    headerName: 'Biopsy Site',
    colId: 'Biopsy Site',
    field: 'Biopsy Site',
    hide: false,
  },
  {
    headerName: 'Pathology Estimated Tumour Content',
    colId: 'Patho TC',
    field: 'Patho TC',
    hide: false,
  },
];

export {
  sampleColumnDefs,
  therapeuticAssociationColDefs,
  cancerRelevanceColDefs,
  getGenomicEvent,
};
