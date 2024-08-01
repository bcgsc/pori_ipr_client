/* eslint-disable no-plusplus */
/* eslint-disable react/no-array-index-key */
import React, {
  useLayoutEffect, useMemo,
} from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef, ValueGetterParams } from '@ag-grid-community/core';
import { v7 as createUuid } from 'uuid';
import { registerHandlers, Handler } from 'pagedjs';
import './index.scss';

export type PrintTableProps = {
  data: Record<string, unknown>[];
  /* colId must be defined if sorting by order */
  columnDefs: ColDef[];
  /* order is only needed if it differs from the columnDef order */
  /* string of headerNames should be used */
  order?: string[];
  /* string of fieldNames for columns to be collapsed */
  collapseableCols?: string[];
  noRowsText?: string;
  fullWidth?: boolean;
  orderByInternalCol?: string;
  orderByInternalColBackup?: string;
};

/**
 * Table display for print view, due to unexpected results from AgGrid
 * Note: ColumnDefs with valueGetters should be in function form
 */
function PrintTable({
  data = [],
  columnDefs = [],
  order = [],
  noRowsText = '',
  collapseableCols = null,
  fullWidth = false,
  orderByInternalCol = null,
  orderByInternalColBackup = null,
}: PrintTableProps): JSX.Element {
  const sortedColDefs = useMemo(() => columnDefs
    .filter((col) => (col.headerName && col.hide !== true && col.headerName !== 'Actions'))
    .sort((columnA, columnB): number => {
      let indexA;
      let indexB;

      if (order?.length > 0) {
        indexA = order.findIndex((key) => (key === columnA.headerName));
        indexB = order.findIndex((key) => (key === columnB.headerName));
      } else {
        indexA = columnDefs.findIndex((col) => (col.headerName === columnA.headerName));
        indexB = columnDefs.findIndex((col) => (col.headerName === columnB.headerName));
      }

      // -1 would sort the column first. Put not found columns last instead
      if (indexA === -1) {
        indexA = columnDefs.length;
      }
      if (indexB === -1) {
        indexB = columnDefs.length;
      }

      if (indexA < indexB) {
        return -1;
      }
      if (indexA > indexB) {
        return 1;
      }
      return 0;
    }), [columnDefs, order]);

  const sortedDataRows = useMemo(() => {
    let component = (
      <tr>
        <td className="table__none" colSpan={sortedColDefs.length}>
          {`${noRowsText || 'No Rows To Show'}`}
        </td>
      </tr>
    );

    if (data.length > 0) {
      const massagedData = [];
      /* Multiple-spam columns params */
      let currRowKey = '';
      let prevRowKey = '';
      let countBack = 1;

      const colIdxsToCombine = {};
      const rowIdxsToSkip = {};
      const rowIdxsToExpand = {};
      let outerRowsMaxRank = {};

      if (orderByInternalCol) {
        outerRowsMaxRank = data.reduce((map, row) => {
          const rowkey = JSON.stringify(collapseableCols.map((val) => row[val]));
          if (!map[rowkey] || row[orderByInternalCol] < map[rowkey]) {
            map[rowkey] = row[orderByInternalCol];
          }
          return map;
        }, {});
      }
      (collapseableCols?.length > 0 ? [...data].sort((aRow, bRow) => {
        const aKey = JSON.stringify(collapseableCols.map((val) => aRow[val]));
        const bKey = JSON.stringify(collapseableCols.map((val) => bRow[val]));
        // ordering inner rows (rows with matching aKey/bKey)
        if (JSON.stringify(aKey) === JSON.stringify(bKey)) {
          // order by 'orderByInternalCol' if possible, then by 'orderByInternalColBackup' if necessary
          if (orderByInternalCol) {
            if (aRow[orderByInternalCol] === bRow[orderByInternalCol]) {
              if (orderByInternalColBackup) {
                if (aRow[orderByInternalColBackup] === bRow[orderByInternalColBackup]) {
                  return 0;
                }
                return aRow[orderByInternalColBackup] > bRow[orderByInternalColBackup] ? 1 : -1;
              }
              return 0;
            }
            return aRow[orderByInternalCol] > bRow[orderByInternalCol] ? 1 : -1;
          }
          return 0;
        }
        // ordering outer rows (rows with different aKey/bKey)
        if (orderByInternalCol) {
          // order by 'orderByInternalCol' if possible, then by outer row key if necessary
          const maxA = outerRowsMaxRank[JSON.stringify(aKey)];
          const maxB = outerRowsMaxRank[JSON.stringify(bKey)];
          if (maxA === maxB) {
            return JSON.stringify(aKey) > JSON.stringify(bKey) ? 1 : -1;
          }
          return maxA > maxB ? 1 : -1;
        }
        return JSON.stringify(aKey) > JSON.stringify(bKey) ? 1 : -1;
      }) : data).forEach((dataRow, rowIdx) => {
        const rowData = [];
        currRowKey = '';

        sortedColDefs.forEach((colD, cellIdx) => {
          // Data section
          const columnIdentifier = colD.colId || colD.field;
          let cellValue = dataRow[columnIdentifier];
          if (colD.valueGetter && typeof colD.valueGetter === 'function') {
            cellValue = colD.valueGetter({ data: dataRow } as ValueGetterParams);
          }

          // Collapseable column check section
          const { field } = colD;
          if (collapseableCols && field && collapseableCols.includes(field)) {
            currRowKey = currRowKey.concat(cellValue as string);
            if (!colIdxsToCombine[cellIdx]) {
              colIdxsToCombine[cellIdx] = true;
            }
          }

          rowData.push(cellValue);
        });

        // Check which rows & cols to collapse into each other
        if (collapseableCols) {
          if (currRowKey !== prevRowKey) {
            prevRowKey = currRowKey;
            countBack = 1;
          } else {
            rowIdxsToSkip[rowIdx] = true;
            if (!rowIdxsToExpand[rowIdx - countBack]) {
              rowIdxsToExpand[rowIdx - countBack] = 2;
            } else {
              rowIdxsToExpand[rowIdx - countBack] += 1;
            }
            countBack += 1;
          }
        }

        massagedData.push(rowData);
      });
      component = (
        <>
          {
            massagedData.map((row, rowIdx) => (
              <tr key={rowIdx} className="table__row">
                {/* eslint-disable-next-line react/no-array-index-key */}
                {row.map((value, cellIdx) => (<td key={`${rowIdx}-${cellIdx}-${value}`}>{value}</td>))}
              </tr>
            ))
          }
        </>
      );
      if (collapseableCols) {
        component = (
          <>
            {
              massagedData.map((row, rowIdx) => (
                <tr key={rowIdx} className="table__row">
                  {/* eslint-disable-next-line react/no-array-index-key */}
                  {row.map((value, cellIdx) => {
                    let clsNames = 'table__cell';
                    let rowSpan = 1;
                    if (rowIdxsToSkip[rowIdx] && colIdxsToCombine[cellIdx]) {
                      clsNames += '--skip';
                    }
                    if (rowIdxsToExpand[rowIdx] && colIdxsToCombine[cellIdx]) {
                      rowSpan = rowIdxsToExpand[rowIdx];
                    }
                    return (
                      <td
                        rowSpan={rowSpan}
                        className={clsNames}
                        key={`${rowIdx}-${cellIdx}-${value}`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            }
          </>
        );
      }
    }
    return component;
  }, [sortedColDefs, noRowsText, data, collapseableCols, orderByInternalCol, orderByInternalColBackup]);

  const tableId = useMemo(() => {
    if (data?.length) {
      return createUuid();
    }
    return null;
  }, [data]);

  useLayoutEffect(() => {
    if (!data.length || !tableId) { return; }
    class MyHandler extends Handler {
      // eslint-disable-next-line class-methods-use-this
      afterRendered() {
        const targetTables: NodeListOf<HTMLTableElement> = document.querySelectorAll(`[data-table-id='${tableId}']`);
        const areAllTablesIdChecked = Array
          .from(targetTables)
          .every((table) => table.getAttribute('data-id-checked') === 'true');
        if (areAllTablesIdChecked) { return; }

        const [firstRow] = targetTables[0].rows;
        const firstRowWidths = Array.from(firstRow.cells).map((cell) => cell.offsetWidth);

        for (let t = 0; t < targetTables.length; t++) {
          for (let r = 0; r < targetTables[t].rows.length; r++) {
            const row = targetTables[t].rows[r];
            if (t > 0 && r === 0) {
              // Reset css of first row of cut-off table
              for (let c1 = 0; c1 < row.cells.length; c1++) {
                if (row.cells[c1].rowSpan < 2 && row.cells[c1].classList.contains('table__cell--skip')) {
                  row.cells[c1].classList.remove('table__cell--skip');
                }
              }
            }
            for (let c2 = 0; c2 < row.cells.length; c2++) {
              row.cells[c2].style.width = `${firstRowWidths[c2]}px`;
            }
          }
          targetTables[t].setAttribute('data-id-checked', 'true');
          targetTables[t].style.tableLayout = 'fixed';
        }
      }
    }
    registerHandlers(MyHandler);
  }, [data, tableId]);

  return (
    <div className="table__container">
      {Boolean(columnDefs.length) && (
        <table data-table-id={tableId} className={`table ${fullWidth ? 'table--full-width' : ''}`}>
          <thead className="table__header">
            <tr>
              {sortedColDefs.map((col) => (
                <th key={col.headerName}>
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedDataRows}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PrintTable;
