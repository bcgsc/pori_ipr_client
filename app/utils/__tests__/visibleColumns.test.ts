import { getColDefId, getDefaultVisibleColIds } from '../visibleColumns';

describe('getColDefId', () => {
  test('prefers colId over field, as ag-grid does', () => {
    expect(getColDefId({ colId: 'oncogene', field: 'gene.oncogene' })).toBe('oncogene');
  });

  test('falls back to field when there is no colId', () => {
    expect(getColDefId({ field: 'breakpoint' })).toBe('breakpoint');
  });
});

describe('getDefaultVisibleColIds', () => {
  test('keeps every definition not marked hide: true', () => {
    expect(getDefaultVisibleColIds([
      { colId: 'genes', hide: false },
      { field: 'breakpoint' },
      { colId: 'oncogene', hide: true },
    ])).toEqual(['genes', 'breakpoint']);
  });

  test('uses the id ag-grid will report when colId and field disagree', () => {
    expect(getDefaultVisibleColIds([
      { colId: 'oncogene', field: 'gene.oncogene', hide: false },
    ])).toEqual(['oncogene']);
  });

  test('flattens column groups to their leaf ids', () => {
    expect(getDefaultVisibleColIds([
      {
        headerName: 'Disease',
        children: [
          { field: 'diseasePercentile', hide: false },
          { field: 'diseasekIQR', hide: true },
        ],
      },
      { field: 'rpkm', hide: false },
    ])).toEqual(['diseasePercentile', 'rpkm']);
  });

  test('never emits an undefined id for a group header', () => {
    const ids = getDefaultVisibleColIds([
      { headerName: 'Primary Site', children: [{ field: 'primarySiteFoldChange' }] },
    ]);
    expect(ids).not.toContain(undefined);
    expect(ids).toEqual(['primarySiteFoldChange']);
  });
});
