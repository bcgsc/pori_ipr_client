// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef, ColGroupDef } from '@ag-grid-community/core';

/**
 * The id ag-grid will report for a column definition.
 *
 * ag-grid resolves an explicit `colId` ahead of `field`, and `DataTable` compares
 * visibility lists against `col.getColId()`. Deriving ids the other way round
 * (field first) silently breaks any column whose `colId` and `field` differ: the
 * id never matches a real column, so the column lands in the "hide everything
 * else" list and disappears.
 */
const getColDefId = (colDef: ColDef): string => colDef.colId ?? colDef.field;

/**
 * Ids of the columns a table should show before the user touches the column
 * picker, i.e. every definition not marked `hide: true`.
 *
 * Column groups carry no id of their own - the leaf children do - so groups are
 * flattened rather than contributing an `undefined` entry.
 */
const getDefaultVisibleColIds = (colDefs: (ColDef | ColGroupDef)[]): string[] => (
  colDefs.reduce<string[]>((accumulated, current) => {
    if ('children' in current) {
      return accumulated.concat(getDefaultVisibleColIds(current.children));
    }
    if ((current as ColDef).hide === true) {
      return accumulated;
    }
    return accumulated.concat(getColDefId(current as ColDef));
  }, [])
);

export { getColDefId, getDefaultVisibleColIds };
