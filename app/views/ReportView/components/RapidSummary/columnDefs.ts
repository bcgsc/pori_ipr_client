import { ColDef } from '@ag-grid-community/core';
import { actionsColDef, ACTIONS_COLUMN } from '@/utils/actionsColumnDef';
import { resolveCellValue } from '@/components/PrintTable/utils';
import { CNVSTATE } from '@/constants';
import { sampleColumnDefs } from '../../common';

const COLLAPSEABLE_COLS = ['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth'];

/**
 * Resolves `COLLAPSEABLE_COLS` against a table's colDefs, matching each key on
 * `colId` or `field`. Preserves COLLAPSEABLE_COLS order — that order defines
 * sort precedence — and skips any key the given table does not define.
 */
const getCollapseableDefs = (colDefs: ColDef[]): ColDef[] => COLLAPSEABLE_COLS
  .map((id) => colDefs.find((c) => c.colId === id || c.field === id))
  .filter((c): c is ColDef => Boolean(c));

/**
 * Hierarchical (lexicographic) comparison of two rows over the values of
 * `relevantDefs`, resolved via each colDef's valueGetter (or the raw row field
 * when no valueGetter is set) through `resolveCellValue` — so it compares the
 * values as rendered, not the underlying fields.
 *
 * Precedence follows the order of `relevantDefs`:
 *  1. Rows are first ordered by the 1st key.
 *  2. Rows tying on the 1st key are then ordered by the 2nd key.
 *  3. Rows tying on the 1st and 2nd keys are then ordered by the 3rd key.
 *  ...and so on for any further keys.
 * Returns 0 when the entire key tuple is equal, so a stable sort leaves those
 * rows in their original relative order.
 *
 * Comparison uses raw `>` (default JS string/number compare). It is NOT
 * locale-aware and NOT numeric-natural — e.g. "10" sorts before "2". If a
 * key needs natural-numeric ordering, swap in a collator for that key.
 *
 * Purpose: used as the final tiebreak by `sortRapidVariants` so rows sharing
 * identical collapseable-key tuples end up adjacent, letting PrintTable's
 * rowSpan-based cell merging engage and keeping the web DataTable in the same
 * row order as the print view.
 */
const compareByCollapseableCols = <T extends Record<string, unknown>>(
  a: T,
  b: T,
  relevantDefs: ColDef[],
): number => {
  for (let i = 0; i < relevantDefs.length; i += 1) {
    const aVal = resolveCellValue(a, relevantDefs[i]);
    const bVal = resolveCellValue(b, relevantDefs[i]);
    if (aVal !== bVal) {
      return aVal > bVal ? 1 : -1;
    }
  }
  return 0;
};

/**
 * Standalone hierarchical sort over `COLLAPSEABLE_COLS` alone, with no
 * alteration-type grouping (see `compareByCollapseableCols` for the ordering
 * semantics). Returns a new, stably sorted array; the input is not mutated.
 */
const sortByCollapseableCols = <T extends Record<string, unknown>>(
  data: T[],
  colDefs: ColDef[],
): T[] => {
  const relevantDefs = getCollapseableDefs(colDefs);
  return [...data].sort((a, b) => compareByCollapseableCols(a, b, relevantDefs));
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
  ...actionsColDef,
  field: ACTIONS_COLUMN,
  minWidth: 132,
};

const VARIANT_TYPE_COLDEF: ColDef = {
  headerName: 'Variant Type',
  field: 'variantType',
  hide: true,
  valueGetter: ({ data: { variantType } }) => variantType || 'N/A',
};

const getCopyChangeValue = ({ copyChange, gene, variantType }) => {
  if (copyChange !== null && copyChange !== undefined) {
    return copyChange;
  }

  if ((variantType === 'cnv' || variantType === 'mut') && gene?.copyVariants?.copyChange !== undefined && gene?.copyVariants?.copyChange !== null) {
    return gene.copyVariants.copyChange;
  }

  return 'N/A';
};

const formatCopyChangeValue = (value) => {
  // Keep empty display for truly missing values, but preserve explicit N/A text.
  if (value === null || value === undefined) return '';
  if (value === 'N/A') return value;

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return `${value}`;
  if (numericValue > 0) return `+${numericValue}`;

  return `${numericValue}`;
};

const COPY_CHANGE_COLDEF: ColDef = {
  headerName: 'Copy Change',
  field: 'copyChange',
  valueGetter: ({ data }) => getCopyChangeValue(data),
  valueFormatter: ({ value }) => formatCopyChangeValue(value),
};

// Fixed reporting order for the rapid summary variant tables (DEVSU-2995).
// Any unrecognised CNV state stays within the CNV block (after amp/homdel),
// msi/tmb markers are grouped with the mutation signatures, and only genuinely
// unknown variant types fall to the trailing bucket — so no row is ever
// dropped or mis-grouped.
const ALTERATION_RANK = {
  SNV: 1, // small mutations (variantType 'mut')
  CNV_AMP: 2, // cnvState in CNVSTATE.AMP
  CNV_HOMLOSS: 3, // cnvState in CNVSTATE.HOMLOSS
  CNV_OTHER: 4, // any other CNV state — kept under CNV, sorted alphabetically
  FUSION: 5, // structural variants (variantType 'sv')
  SIGNATURE: 6, // mutation signatures: 'sigv', plus 'msi'/'tmb' markers
  FALLBACK: 7, // unrecognised variant types
} as const;

// Case-insensitive on BOTH sides: CNVSTATE mixes 'Hom Loss' with 'deep
// deletion', so a one-sided lowercase (as done in the CopyNumber view) would
// silently miss the capitalised entries.
const isCnvState = (cnvState: unknown, states: string[]): boolean => {
  if (typeof cnvState !== 'string') return false;
  const normalized = cnvState.toLowerCase();
  return states.some((state) => state.toLowerCase() === normalized);
};

/**
 * Alteration-type rank for a rapid summary row; see ALTERATION_RANK for the
 * group order. Within the amp/homdel groups the caller additionally orders by
 * copy change high -> low; every other group (CNV_OTHER included) falls back to
 * alphabetical (genomic-event) order.
 */
const getAlterationRank = (row: Record<string, unknown>): number => {
  switch (row.variantType) {
    case 'mut':
      return ALTERATION_RANK.SNV;
    case 'cnv':
      if (isCnvState(row.cnvState, CNVSTATE.AMP)) return ALTERATION_RANK.CNV_AMP;
      if (isCnvState(row.cnvState, CNVSTATE.HOMLOSS)) return ALTERATION_RANK.CNV_HOMLOSS;
      return ALTERATION_RANK.CNV_OTHER;
    case 'sv':
      return ALTERATION_RANK.FUSION;
    case 'sigv':
    case 'msi':
    case 'tmb':
      return ALTERATION_RANK.SIGNATURE;
    default:
      return ALTERATION_RANK.FALLBACK;
  }
};

// Numeric copy change used to order rows within a CNV group high -> low.
// Missing / non-numeric copy change sorts to the bottom of its group.
const getCopyChangeNumber = (row: Record<string, unknown>): number => {
  const numeric = Number(getCopyChangeValue(row as unknown as Parameters<typeof getCopyChangeValue>[0]));
  return Number.isNaN(numeric) ? Number.NEGATIVE_INFINITY : numeric;
};

/**
 * Orders rapid summary rows (Table 1 & Table 2) by alteration type
 * (see getAlterationRank), then — within the amp/homdel groups only — by copy
 * change high -> low, then falls back to the collapseable-column ordering. The
 * collapseable fallback keeps rows with identical keys adjacent for
 * PrintTable's rowSpan merging and keeps web/print render order in sync.
 */
const sortRapidVariants = <T extends Record<string, unknown>>(
  data: T[],
  colDefs: ColDef[],
): T[] => {
  const relevantDefs = getCollapseableDefs(colDefs);
  return [...data].sort((a, b) => {
    const rank = getAlterationRank(a);
    const rankDiff = rank - getAlterationRank(b);
    if (rankDiff !== 0) return rankDiff;

    // Copy-number ordering (high -> low) applies only within the amp and homdel
    // groups; other CNV states fall through to alphabetical order.
    if (rank === ALTERATION_RANK.CNV_AMP || rank === ALTERATION_RANK.CNV_HOMLOSS) {
      const copyDiff = getCopyChangeNumber(b) - getCopyChangeNumber(a);
      if (copyDiff !== 0) return copyDiff;
    }

    return compareByCollapseableCols(a, b, relevantDefs);
  });
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
  sortRapidVariants,
  getAlterationRank,
};
