/**
 * @param row KbMatch data
 * @returns correct genomic event to be displayed
 */
const getGenomicEvent = ({ data }) => {
  const { variantType } = data;
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

  // variantType === mut and others
  const { hgvsProtein, hgvsCds, hgvsGenomic } = data;
  if (hgvsProtein) { return hgvsProtein; }
  if (hgvsCds) { return hgvsCds; }
  return hgvsGenomic;
};

const clinicalAssociationColDefs = [
  {
    headerName: 'Genomic Events',
    colId: 'Genomic Events',
    valueGetter: getGenomicEvent,
    hide: false,
  },
  {
    headerName: 'Alt/Total (Tumour DNA)',
    colId: 'Alt/Total (Tumour DNA)',
    valueGetter: ({ data: { tumourAltCount, tumourDepth } }) => {
      if (tumourAltCount !== null && tumourDepth !== null) {
        return `${tumourAltCount}/${tumourDepth}`;
      }
      return '';
    },
    hide: false,
  },
  {
    headerName: 'VAF',
    colId: 'tumourDepth',
    field: 'tumourDepth',
    valueGetter: ({ data: { tumourAltCount, tumourDepth } }) => {
      if (tumourAltCount && tumourDepth) {
        return (tumourAltCount / tumourDepth).toFixed(2);
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
    headerName: 'Alt/Total (Tumour DNA)',
    colId: 'Alt/Total (Tumour DNA)',
    valueGetter: ({ data: { tumourAltCount, tumourDepth } }) => {
      if (tumourAltCount && tumourDepth) {
        return `${tumourAltCount}/${tumourDepth}`;
      }
      return '';
    },
    hide: false,
  },
  {
    headerName: 'VAF',
    colId: 'variant.tumourDepth',
    field: 'variant.tumourDepth',
    valueGetter: ({ data: { tumourAltCount, tumourDepth } }) => {
      if (tumourAltCount && tumourDepth) {
        return (tumourAltCount / tumourDepth).toFixed(2);
      }
      return '';
    },
    hide: false,
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
  clinicalAssociationColDefs,
  cancerRelevanceColDefs,
  getGenomicEvent,
};
