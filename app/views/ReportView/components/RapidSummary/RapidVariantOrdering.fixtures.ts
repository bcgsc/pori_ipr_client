/**
 * Shared fixtures for the rapid summary variant-ordering demo.
 *
 * One deliberately-shuffled set of rows covering every alteration bucket, plus
 * the exact genomic-event order they must render in. Imported by BOTH the
 * Storybook story (visual) and the jest test (assertion) so the demo and its
 * check can never drift. Each row carries only the fields the rapid column
 * defs read (see getGenomicEvent / getCopyChangeValue).
 */

import { sortRapidVariants, therapeuticAssociationColDefs } from './columnDefs';

type DemoRow = Record<string, unknown>;

// Intentionally out of order — the sort is what puts these right.
const MOCK_RAPID_VARIANTS: DemoRow[] = [
  {
    ident: 'gain-tp53', variantType: 'cnv', gene: { name: 'TP53' }, cnvState: 'Gain', copyChange: 9,
  },
  { ident: 'sig-tmb', variantType: 'tmb', kbCategory: 'TMB-High' },
  {
    ident: 'del-atm', variantType: 'cnv', gene: { name: 'ATM' }, cnvState: 'Hom Loss', copyChange: -5,
  },
  {
    ident: 'amp-erbb2', variantType: 'cnv', gene: { name: 'ERBB2' }, cnvState: 'Amp', copyChange: 6, potentialClinicalAssociation: 'sensitivity to trastuzumab (IPR-A)',
  },
  {
    ident: 'snv-braf', variantType: 'mut', gene: { name: 'BRAF' }, proteinChange: 'V600E', tumourAltCount: 55, tumourDepth: 110, potentialClinicalAssociation: 'sensitivity to dabrafenib (IPR-A)',
  },
  {
    ident: 'fus-eml4', variantType: 'sv', gene1: { name: 'EML4' }, gene2: { name: 'ALK' }, exon1: '6', exon2: '20', potentialClinicalAssociation: 'sensitivity to crizotinib (IPR-A)',
  },
  {
    ident: 'amp-myc', variantType: 'cnv', gene: { name: 'MYC' }, cnvState: 'amplification', copyChange: 12,
  },
  { ident: 'sig-msi', variantType: 'msi', kbCategory: 'MSI' },
  {
    ident: 'del-pten', variantType: 'cnv', gene: { name: 'PTEN' }, cnvState: 'Homozygous Loss', copyChange: -1,
  },
  {
    ident: 'gain-abl1', variantType: 'cnv', gene: { name: 'ABL1' }, cnvState: 'Gain', copyChange: 3,
  },
  {
    ident: 'snv-akt1', variantType: 'mut', gene: { name: 'AKT1' }, proteinChange: 'E17K', tumourAltCount: 40, tumourDepth: 100, potentialClinicalAssociation: 'sensitivity to capivasertib (IPR-B)',
  },
  {
    ident: 'sig-sbs3', variantType: 'sigv', displayName: 'SBS3', signatureName: 'SBS3',
  },
];

// The genomic-event label of each row, in the order sortRapidVariants must
// produce. Comments call out the requirement each grouping demonstrates.
const EXPECTED_GENOMIC_EVENT_ORDER: string[] = [
  'AKT1:E17K', // SNVs, alphabetical
  'BRAF:V600E',
  'MYC amplification', // CNV amps, copy change high -> low (MYC +12 before ERBB2 +6, i.e. NOT alphabetical)
  'ERBB2 Amp',
  'PTEN Homozygous Loss', // CNV homdels, copy change high -> low (PTEN -1 before ATM -5, i.e. NOT alphabetical)
  'ATM Hom Loss',
  'ABL1 Gain', // other CNV states, below amp/homdel, alphabetical (ABL1 before TP53 despite TP53's higher copy change)
  'TP53 Gain',
  '(EML4,ALK):fusion(e.6,e.20)', // fusions / SVs
  'MSI', // mutation signatures: sigv + msi/tmb, alphabetical
  'SBS3',
  'TMB-High',
];

// Repeated variants (the same variant across several clinical associations) so
// the collapseable columns actually span in the collapsed-rows stories. Kept
// out of MOCK_RAPID_VARIANTS so the jest expected-order fixture stays one row
// per genomic event.
const REPEATED_ASSOCIATION_ROWS: DemoRow[] = [
  {
    ident: 'snv-braf-resistance', variantType: 'mut', gene: { name: 'BRAF' }, proteinChange: 'V600E', tumourAltCount: 55, tumourDepth: 110, potentialClinicalAssociation: 'resistance to panitumumab (IPR-B)',
  },
  {
    ident: 'amp-erbb2-lapatinib', variantType: 'cnv', gene: { name: 'ERBB2' }, cnvState: 'Amp', copyChange: 6, potentialClinicalAssociation: 'sensitivity to lapatinib (IPR-A)',
  },
];

const SORTED_WITH_REPEATS = sortRapidVariants(
  [...MOCK_RAPID_VARIANTS, ...REPEATED_ASSOCIATION_ROWS],
  therapeuticAssociationColDefs,
);

export {
  MOCK_RAPID_VARIANTS,
  EXPECTED_GENOMIC_EVENT_ORDER,
  REPEATED_ASSOCIATION_ROWS,
  SORTED_WITH_REPEATS,
};
