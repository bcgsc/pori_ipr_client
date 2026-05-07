import { ITooltipParams } from '@ag-grid-community/core';

import { arrayTooltipValueGetter } from '..';

const params = (value: unknown, valueFormatted?: unknown) => ({ value, valueFormatted }) as ITooltipParams;

describe('arrayTooltipValueGetter', () => {
  test('joins array values with a comma separator', () => {
    expect(arrayTooltipValueGetter(params(['apple', 'banana', 'cherry']))).toBe('apple, banana, cherry');
  });

  test('filters null values from array', () => {
    expect(arrayTooltipValueGetter(params(['apple', null, 'cherry']))).toBe('apple, cherry');
  });

  test('filters empty string values from array', () => {
    expect(arrayTooltipValueGetter(params(['apple', '', 'cherry']))).toBe('apple, cherry');
  });

  test('returns a non-array value as-is', () => {
    expect(arrayTooltipValueGetter(params('plain string'))).toBe('plain string');
  });

  test('returns null as-is when value is null', () => {
    expect(arrayTooltipValueGetter(params(null))).toBeNull();
  });

  test('prefers valueFormatted over value', () => {
    expect(arrayTooltipValueGetter(params(['raw'], 'formatted'))).toBe('formatted');
  });

  test('uses value when valueFormatted is undefined', () => {
    expect(arrayTooltipValueGetter(params(['apple', 'banana'], undefined))).toBe('apple, banana');
  });
});
