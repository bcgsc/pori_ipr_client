import { ColDef, ValueGetterParams } from '@ag-grid-community/core';

const getNestedValue = (row: Record<string, unknown>, path: string) => path
  .split('.')
  .reduce<unknown>((currentValue, key) => {
    if (currentValue === null || currentValue === undefined) {
      return undefined;
    }
    if (typeof currentValue !== 'object') {
      return undefined;
    }
    return (currentValue as Record<string, unknown>)[key];
  }, row);

// Resolves the displayed value of a cell for a given row + colDef, applying
// the colDef's valueGetter when present and falling back to row[colId|field].
// Shared by PrintTable's row-rendering / collapse-key logic and any caller
// that needs to derive the same values outside of AgGrid (e.g. pre-sorting
// data so DataTable and PrintTable render rows in matching order).
export const resolveCellValue = <T extends Record<string, unknown>>(
  row: T,
  colDef: ColDef,
): unknown => {
  if (typeof colDef.valueGetter === 'function') {
    return colDef.valueGetter({ data: row } as ValueGetterParams);
  }
  const key = (colDef.field ?? colDef.colId) as string;
  if (!key) {
    return undefined;
  }
  if (key.includes('.')) {
    return getNestedValue(row, key);
  }
  return row[key];
};
