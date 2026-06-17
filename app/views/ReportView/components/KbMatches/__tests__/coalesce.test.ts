import { KbMatchedStatementType, KbMatchType } from '@/common';
import { coalesceEntries, getVariantName, getBucketKey } from '../coalesce';

describe('getVariantName', () => {
  test('formats a small mutation as gene:proteinChange', () => {
    expect(getVariantName({ gene: { name: 'TP53' }, proteinChange: 'p.R175H' } as KbMatchType<'mut'>['variant'], 'mut')).toBe('TP53:p.R175H');
  });

  test('formats a copy variant as gene cnvState', () => {
    expect(getVariantName({ gene: { name: 'EGFR' }, cnvState: 'amplification' } as KbMatchType<'cnv'>['variant'], 'cnv')).toBe('EGFR amplification');
  });

  test('formats a structural variant as a fusion string', () => {
    const variant = {
      gene1: { name: 'BRAF' }, gene2: { name: 'KIAA1549' }, exon1: 9, exon2: 16,
    } as unknown as KbMatchType<'sv'>['variant'];
    expect(getVariantName(variant, 'sv')).toBe('(BRAF,KIAA1549):fusion(e.9,e.16)');
  });

  test('uses kbCategory for msi/tmb variants', () => {
    expect(getVariantName({ kbCategory: 'MSI high' } as KbMatchType<'msi'>['variant'], 'msi')).toBe('MSI high');
  });

  test('falls back to gene expressionState for expression variants', () => {
    expect(getVariantName({ gene: { name: 'PTEN' }, expressionState: 'underexpressed' } as KbMatchType<'exp'>['variant'], 'exp')).toBe('PTEN underexpressed');
  });
});

const makeEntry = (overrides: Partial<KbMatchedStatementType> = {}) => ({
  context: 'sensitivity',
  relevance: 'resistance',
  disease: 'cancer',
  reference: 'ref-a;ref-b',
  kbMatches: [
    { ident: 'kb-1', variantType: 'mut', variant: { gene: { name: 'TP53' }, proteinChange: 'p.R175H' } },
  ],
  ...overrides,
}) as unknown as KbMatchedStatementType;

describe('getBucketKey', () => {
  test('builds a composite key from context, variant, relevance and disease', () => {
    expect(getBucketKey(makeEntry())).toBe('sensitivity||TP53:p.R175H||resistance||cancer');
  });

  test('returns null when there are no kb matches', () => {
    expect(getBucketKey(makeEntry({ kbMatches: [] }))).toBeNull();
  });
});

describe('coalesceEntries', () => {
  test('merges entries that share a bucket key', () => {
    const result = coalesceEntries([
      makeEntry(),
      makeEntry({
        kbMatches: [
          { ident: 'kb-2', variantType: 'mut', variant: { gene: { name: 'TP53' }, proteinChange: 'p.R175H' } },
        ] as unknown as KbMatchType<'mut'>[],
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].kbMatches.map((m) => m.ident)).toEqual(['kb-1', 'kb-2']);
  });

  test('keeps entries with different bucket keys separate', () => {
    const result = coalesceEntries([
      makeEntry({ disease: 'cancer A' }),
      makeEntry({ disease: 'cancer B' }),
    ]);

    expect(result).toHaveLength(2);
  });

  test('collapses differing scalar fields into an array', () => {
    const result = coalesceEntries([
      makeEntry({ iprEvidenceLevel: 'IPR-A' } as KbMatchedStatementType),
      makeEntry({ iprEvidenceLevel: 'IPR-B' } as KbMatchedStatementType),
    ]);

    expect(result).toHaveLength(1);
    expect((result[0] as unknown as { iprEvidenceLevel: string[] }).iprEvidenceLevel).toEqual(['IPR-A', 'IPR-B']);
  });

  test('splits the reference string on semicolons', () => {
    const [entry] = coalesceEntries([makeEntry()]);

    expect(entry.reference).toEqual(['ref-a', 'ref-b']);
  });
});
