import { ExpOutliersType } from '../types';
import processExpression from '../processData';

const makeRow = (overrides = {}) => ({
  gene: { oncogene: false, tumourSuppressor: false },
  expressionState: 'normal',
  kbMatches: [],
  ...overrides,
}) as unknown as ExpOutliersType;

const withCategory = (category: string) => [
  { kbMatchedStatements: [{ category }] },
];

describe('processExpression', () => {
  test('groups an upregulated oncogene into upreg_onco', () => {
    const row = makeRow({ gene: { oncogene: true }, expressionState: 'outlier_high' });
    const result = processExpression([row]);

    expect(result.upreg_onco).toContain(row);
    expect(result.downreg_tsg).toHaveLength(0);
  });

  test('groups a downregulated tumour suppressor into downreg_tsg', () => {
    const row = makeRow({ gene: { tumourSuppressor: true }, expressionState: 'outlier_low' });
    const result = processExpression([row]);

    expect(result.downreg_tsg).toContain(row);
    expect(result.upreg_onco).toHaveLength(0);
  });

  test('groups kb matches by statement category', () => {
    const therapeutic = makeRow({ kbMatches: withCategory('therapeutic') });
    const diagnostic = makeRow({ kbMatches: withCategory('diagnostic') });
    const prognostic = makeRow({ kbMatches: withCategory('prognostic') });
    const biological = makeRow({ kbMatches: withCategory('biological') });

    const result = processExpression([therapeutic, diagnostic, prognostic, biological]);

    expect(result.clinical).toEqual([therapeutic]);
    expect(result.nostic).toEqual([diagnostic, prognostic]);
    expect(result.biological).toEqual([biological]);
  });

  test('normalizes expressionState casing before matching', () => {
    const row = makeRow({ gene: { oncogene: true }, expressionState: 'OUTLIER_HIGH' });
    const result = processExpression([row]);

    expect(result.upreg_onco).toContain(row);
  });

  test('returns empty groups for input that matches nothing', () => {
    const result = processExpression([makeRow()]);

    expect(result.clinical).toHaveLength(0);
    expect(result.nostic).toHaveLength(0);
    expect(result.biological).toHaveLength(0);
    expect(result.upreg_onco).toHaveLength(0);
    expect(result.downreg_tsg).toHaveLength(0);
  });
});
