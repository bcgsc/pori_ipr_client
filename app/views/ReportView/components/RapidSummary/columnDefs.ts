import { ColDef } from '@ag-grid-community/core';
import { resolveCellValue } from '@/components/PrintTable/utils';
import { sampleColumnDefs } from '../../common';

const COLLAPSEABLE_COLS = ['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth'];

/**
 * Hierarchical (lexicographic) sort over the values of `COLLAPSEABLE_COLS`,
 * resolved against `colDefs` via each colDef's valueGetter (or raw row field
 * when no valueGetter is set) through `resolveCellValue`.
 *
 * Sort precedence follows the order of `COLLAPSEABLE_COLS`:
 *  1. Rows are first ordered by the 1st key.
 *  2. Rows tying on the 1st key are then ordered by the 2nd key.
 *  3. Rows tying on the 1st and 2nd keys are then ordered by the 3rd key.
 *  ...and so on for any further keys.
 * Rows whose entire key tuple is equal are returned as equal — JS's stable
 * sort preserves their original relative order in that case.
 *
 * Example with COLLAPSEABLE_COLS = ['a', 'b', 'c']:
 *   first bucket by `a`; within each `a`-bucket sub-bucket by `b`; within
 *   each `(a,b)`-bucket sub-bucket by `c`.
 *
 * Comparison uses raw `>` (default JS string/number compare). It is NOT
 * locale-aware and NOT numeric-natural — e.g. "10" sorts before "2". If a
 * key needs natural-numeric ordering, swap in a collator for that key.
 *
 * Purpose: place rows sharing identical collapseable-key tuples adjacent so
 * PrintTable's rowSpan-based cell merging engages, and so the web DataTable
 * renders rows in the same order as the print view.
 */
const sortByCollapseableCols = <T extends Record<string, unknown>>(
  data: T[],
  colDefs: ColDef[],
): T[] => {
  const relevantDefs = COLLAPSEABLE_COLS
    .map((id) => colDefs.find((c) => c.colId === id || c.field === id))
    .filter((c): c is ColDef => Boolean(c));

  return [...data].sort((a, b) => {
    for (let i = 0; i < relevantDefs.length; i += 1) {
      const aVal = resolveCellValue(a, relevantDefs[i]);
      const bVal = resolveCellValue(b, relevantDefs[i]);
      if (aVal !== bVal) {
        return aVal > bVal ? 1 : -1;
      }
    }
    return 0;
  });
};

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

const ACTIONS_COLDEF: ColDef = {
  headerName: 'Actions',
  colId: 'Actions',
  field: 'Actions',
  cellRenderer: 'ActionCellRenderer',
  pinned: 'right',
  hide: false,
  sortable: false,
  suppressMenu: true,
  minWidth: 132,
};

const VARIANT_TYPE_COLDEF: ColDef = {
  headerName: 'Variant Type',
  field: 'variantType',
  hide: true,
  valueGetter: ({ data: { variantType } }) => variantType || 'N/A',
};

const COPY_CHANGE_COLDEF: ColDef = {
  headerName: 'Copy Change',
  field: 'copyChange',
  valueGetter: ({ data: { copyChange, gene, variantType } }) => {
    if (copyChange) {
      return copyChange;
    }
    if (variantType === 'cnv') {
      if (gene && gene.copyVariants) {
        return gene.copyVariants.copyChange;
      }
    }
    return 'N/A';
  },
};

const therapeuticAssociationColDefs: ColDef[] = [
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
    ...VARIANT_TYPE_COLDEF,
  },
  {
    ...COPY_CHANGE_COLDEF,
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

const cancerRelevanceColDefs: ColDef[] = [
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
    ...COPY_CHANGE_COLDEF,
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

const cancerRelevancePrintColDefs = cancerRelevanceColDefs.filter((col) => col.headerName !== 'Actions');
const therapeuticAssociationPrintColDefs = therapeuticAssociationColDefs.filter((col) => col.headerName !== 'Actions');

export {
  sampleColumnDefs,
  therapeuticAssociationColDefs,
  cancerRelevanceColDefs,
  cancerRelevancePrintColDefs,
  therapeuticAssociationPrintColDefs,
  getGenomicEvent,
  COLLAPSEABLE_COLS,
  sortByCollapseableCols,
};
