import {
  sortRapidVariants,
  getAlterationRank,
  therapeuticAssociationColDefs,
} from '../columnDefs';

// Minimal rows carrying only the fields the sort + collapseable tiebreak read.
const mut = (ident: string, gene: string, proteinChange: string) => ({
  ident, variantType: 'mut', gene: { name: gene }, proteinChange,
});
const cnv = (ident: string, gene: string, cnvState: string, copyChange: number | null) => ({
  ident, variantType: 'cnv', gene: { name: gene }, cnvState, copyChange,
});
const sv = (ident: string, gene1: string, gene2: string) => ({
  ident, variantType: 'sv', gene1: { name: gene1 }, gene2: { name: gene2 }, exon1: '1', exon2: '2',
});
const sigv = (ident: string, displayName: string) => ({
  ident, variantType: 'sigv', displayName,
});
const marker = (ident: string, variantType: 'msi' | 'tmb', kbCategory: string) => ({
  ident, variantType, kbCategory,
});

const order = (rows) => sortRapidVariants(rows, therapeuticAssociationColDefs).map((r) => r.ident);

describe('getAlterationRank', () => {
  test('ranks the named alteration buckets in spec order', () => {
    expect(getAlterationRank(mut('a', 'BRAF', 'V600E'))).toBe(1);
    expect(getAlterationRank(cnv('a', 'MYC', 'amplification', 8))).toBe(2);
    expect(getAlterationRank(cnv('a', 'CDKN2A', 'Homozygous Loss', -2))).toBe(3);
    expect(getAlterationRank(cnv('a', 'EGFR', 'Gain', 2))).toBe(4);
    expect(getAlterationRank(sv('a', 'EML4', 'ALK'))).toBe(5);
    expect(getAlterationRank(sigv('a', 'SBS3'))).toBe(6);
  });

  test('matches cnvState case-insensitively on both sides', () => {
    // CNVSTATE.HOMLOSS contains the capitalised 'Hom Loss'
    expect(getAlterationRank(cnv('a', 'PTEN', 'hom loss', -3))).toBe(3);
    expect(getAlterationRank(cnv('a', 'MYC', 'AMPLIFICATION', 8))).toBe(2);
  });

  test('keeps unrecognised CNV states under the CNV block (after amp/homdel)', () => {
    expect(getAlterationRank(cnv('a', 'EGFR', 'Gain', 2))).toBe(4);
    expect(getAlterationRank(cnv('a', 'TP53', 'Loss', -1))).toBe(4);
    expect(getAlterationRank(cnv('a', 'X', 'Neutral', 0))).toBe(4);
  });

  test('groups msi and tmb markers with the signature bucket', () => {
    expect(getAlterationRank(marker('a', 'msi', 'MSI'))).toBe(6);
    expect(getAlterationRank(marker('a', 'tmb', 'High TMB'))).toBe(6);
  });

  test('sends genuinely unknown variant types to the trailing fallback bucket', () => {
    expect(getAlterationRank({ ident: 'a', variantType: 'wat' })).toBe(7);
  });
});

describe('sortRapidVariants', () => {
  test('groups rows by alteration type in the requested order', () => {
    const rows = [
      marker('msi', 'msi', 'MSI'),
      sigv('sig', 'SBS3'),
      sv('fusion', 'EML4', 'ALK'),
      cnv('other', 'EGFR', 'Gain', 2),
      cnv('homdel', 'CDKN2A', 'Homozygous Loss', -2),
      cnv('amp', 'MYC', 'amplification', 8),
      mut('snv', 'BRAF', 'V600E'),
    ];
    // Within the signature group, 'MSI' < 'SBS3' alphabetically.
    expect(order(rows)).toEqual(['snv', 'amp', 'homdel', 'other', 'fusion', 'msi', 'sig']);
  });

  test('orders CNV amplifications by copy change high -> low', () => {
    const rows = [
      cnv('amp4', 'ERBB2', 'amplification', 4),
      cnv('amp12', 'MYC', 'amplification', 12),
      cnv('amp8', 'CCND1', 'Amp', 8),
    ];
    expect(order(rows)).toEqual(['amp12', 'amp8', 'amp4']);
  });

  test('orders homozygous deletions by copy change high -> low (least negative first)', () => {
    const rows = [
      cnv('deep', 'PTEN', 'Homozygous Loss', -5),
      cnv('shallow', 'CDKN2A', 'Homozygous Loss', -1),
    ];
    expect(order(rows)).toEqual(['shallow', 'deep']);
  });

  test('sorts missing copy change to the bottom of the amp group', () => {
    const rows = [
      cnv('missing', 'MYC', 'amplification', null),
      cnv('present', 'ERBB2', 'amplification', 3),
    ];
    expect(order(rows)).toEqual(['present', 'missing']);
  });

  test('orders other-CNV alphabetically, NOT by copy change', () => {
    const rows = [
      cnv('gainT', 'TP53', 'Gain', 9), // higher copy change but later gene
      cnv('gainA', 'ABL1', 'Gain', 1),
      cnv('amp', 'MYC', 'amplification', 3),
    ];
    // amp first (rank 2); then other-CNV by gene name, ignoring copy change.
    expect(order(rows)).toEqual(['amp', 'gainA', 'gainT']);
  });

  test('keeps alphabetical (genomic-event) order within a non-CNV group', () => {
    const rows = [
      mut('braf', 'BRAF', 'V600E'),
      mut('akt1', 'AKT1', 'E17K'),
    ];
    expect(order(rows)).toEqual(['akt1', 'braf']);
  });

  test('groups msi/tmb with signatures, after fusions', () => {
    const rows = [
      marker('tmb', 'tmb', 'High TMB'),
      sv('fusion', 'EML4', 'ALK'),
      sigv('sig', 'SBS3'),
    ];
    // fusion (rank 5) before signatures (rank 6); within signatures 'High TMB' < 'SBS3'.
    expect(order(rows)).toEqual(['fusion', 'tmb', 'sig']);
  });

  test('places genuinely unknown variant types after every named bucket', () => {
    const rows = [
      { ident: 'unknown', variantType: 'wat', displayName: 'zzz' },
      mut('snv', 'BRAF', 'V600E'),
      sigv('sig', 'SBS3'),
    ];
    expect(order(rows)).toEqual(['snv', 'sig', 'unknown']);
  });
});
