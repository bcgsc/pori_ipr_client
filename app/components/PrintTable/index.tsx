/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef, ValueGetterParams } from '@ag-grid-community/core';

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
};

/**
 * Table display for print view, due to unexpected results from AgGrid
 * Note: ColumnDefs with valueGetters should be in function form
 */
const PrintTable = ({
  data = [],
  columnDefs = [],
  order = [],
  noRowsText = '',
  collapseableCols = null,
  fullWidth = false,
}: PrintTableProps): JSX.Element => {
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

      (collapseableCols?.length > 0 ? [...data].sort((aRow, bRow) => {
        const aKey = collapseableCols.map((val) => aRow[val]);
        const bKey = collapseableCols.map((val) => bRow[val]);
        if (aKey === bKey) return 0;
        return aKey > bKey ? 1 : -1;
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
  }, [sortedColDefs, noRowsText, data, collapseableCols]);

  return (
    <div className="table-container">
      {Boolean(columnDefs.length) && (
        <table className={`table ${fullWidth ? 'table--full-width' : ''}`}>
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
};

export default PrintTable;
