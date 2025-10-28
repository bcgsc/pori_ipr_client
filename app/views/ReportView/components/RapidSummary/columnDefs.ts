import { sampleColumnDefs } from '../../common';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * @param row KbMatch data
 * @returns correct genomic event to be displayed
 */
const getGenomicEvent = ({ data }) => {
  const {
    gene, proteinChange, variantType, kbCategory, displayName,
  } = data;
  if (variantType === 'cnv') {
    const { cnvState } = data;
    return `${gene.name} ${cnvState}`;
  }

  if (displayName) {
    return displayName;
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
    comparator: collator.compare,
    hide: false,
  },
  {
    headerName: 'Comments',
    field: 'comments',
    hide: true,
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
    comparator: collator.compare,
    hide: false,
  },
  {
    headerName: 'Comments',
    field: 'comments',
    hide: true,
  },
  {
    ...ACTIONS_COLDEF,
  },
];

export {
  sampleColumnDefs,
  therapeuticAssociationColDefs,
  cancerRelevanceColDefs,
  getGenomicEvent,
};
