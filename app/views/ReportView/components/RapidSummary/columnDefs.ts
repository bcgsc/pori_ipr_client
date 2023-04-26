/**
 * @param row KbMatch data
 * @returns correct genomic event to be displayed
 */
const getGenomicEvent = ({ data }) => {
  const { variantType, kbCategory } = data;
  if (variantType === 'cnv') {
    const { gene, cnvState } = data;
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

  if (variantType === 'msi') {
    return kbCategory;
  }

  // variantType === mut and others
  const { hgvsProtein, hgvsCds, hgvsGenomic } = data;
  if (hgvsProtein) { return hgvsProtein; }
  if (hgvsCds) { return hgvsCds; }
  return hgvsGenomic;
};

const therapeuticAssociationColDefs = [
  {
    headerName: 'Genomic Events',
    colId: 'Genomic Events',
    valueGetter: getGenomicEvent,
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour)',
    colId: 'Alt/Total (Tumour)',
    valueGetter: ({
      data: {
        tumourAltCount, tumourDepth, rnaAltCount, rnaDepth,
      },
    }) => {
      if (tumourAltCount !== null && tumourDepth !== null) {
        return `${tumourAltCount}/${tumourDepth}`;
      }
      if (rnaAltCount !== null && rnaDepth !== null) {
        return `${rnaAltCount}/${rnaDepth}`;
      }
      return '';
    },
    hide: false,
  },
  {
    headerName: 'VAF %',
    colId: 'tumourAltCount/tumourDepth',
    valueGetter: ({ data: { tumourAltCount, tumourDepth } }) => {
      if (tumourAltCount !== null && tumourDepth !== null) {
        return ((tumourAltCount / tumourDepth) * 100).toFixed(0);
      }
      return '';
    },
    hide: false,
  },
  {
    headerName: 'Potential Clinical Association',
    colId: 'potentialClinicalAssociation',
    field: 'potentialClinicalAssociation',
    hide: false,
  },
  {
    headerName: 'Comments',
    field: 'comments',
    hide: false,
  },
  {
    headerName: 'Actions',
    colId: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    hide: false,
    sortable: false,
    suppressMenu: true,
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
    valueGetter: ({ data: { tumourAltCount, tumourDepth } }) => {
      if (tumourAltCount && tumourDepth) {
        return `${tumourAltCount}/${tumourDepth}`;
      }
      return '';
    },
    hide: false,
  },
  {
    headerName: 'VAF %',
    colId: 'tumourAltCount/tumourDepth',
    valueGetter: ({ data: { tumourAltCount, tumourDepth } }) => {
      if (tumourAltCount && tumourDepth) {
        return ((tumourAltCount / tumourDepth) * 100).toFixed(0);
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
    headerName: 'Actions',
    colId: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    hide: false,
    sortable: false,
    suppressMenu: true,
  },
];

const sampleColumnDefs = [
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
