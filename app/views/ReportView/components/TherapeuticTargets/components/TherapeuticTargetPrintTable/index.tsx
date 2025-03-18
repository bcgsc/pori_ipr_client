import React, { useMemo } from 'react';

import { ColDef } from '@ag-grid-community/core';
import { TherapeuticDataTableType } from '../../types';

const getCellValue = (row, col) => {
  if (col.valueGetter) return col.valueGetter({ data: row });
  for (const key of [col.colId, col.field, col.headerName]) {
    if (key && row[key] !== undefined) return row[key];
  }
  return '';
};

const mergeCells = (sortedData, coalesce) => {
  const spanMap = {};

  coalesce.forEach((columnKey, colIndex) => {
    let previousValue = null;
    let mergeCount = 0;
    let mergeStartIndex = null;

    sortedData.forEach((row, rowIndex) => {
      const currentValue = getCellValue(row, {
        colId: columnKey,
        field: columnKey,
        headerName: columnKey,
      });

      // If this is not the first column in coalesce, check if the previous column is merged
      const isFirstColumn = colIndex === 0;
      const previousColumnKey = coalesce[colIndex - 1];
      const isGroupedWithPrevious = isFirstColumn
        || (previousColumnKey
          && rowIndex > 0
          && getCellValue(sortedData[rowIndex - 1], {
            colId: previousColumnKey,
            field: previousColumnKey,
            headerName: previousColumnKey,
          }) === getCellValue(row, {
            colId: previousColumnKey,
            field: previousColumnKey,
            headerName: previousColumnKey,
          }));

      if (currentValue === previousValue && isGroupedWithPrevious) {
        // Extend the current merged cell group
        // eslint-disable-next-line no-plusplus
        mergeCount++;
        spanMap[`${rowIndex}-${columnKey}`] = 0; // Hide this row's cell

        if (mergeStartIndex !== null) {
          spanMap[`${mergeStartIndex}-${columnKey}`] = mergeCount; // Update the main merged cell's rowspan
        }
      } else {
        // Start a new merge group
        mergeCount = 1;
        mergeStartIndex = rowIndex;
        spanMap[`${rowIndex}-${columnKey}`] = mergeCount;
        previousValue = currentValue;
      }
    });
  });

  return spanMap;
};

const COLUMNDEFS_TO_IGNORE = ['drag', 'actions'];
type TherapeuticTargetPrintTableProps = {
  data: TherapeuticDataTableType;
  columnDefs: ColDef[];
  /**
   * colId or field name to coalesce repeating row values
   * Subsequent colId/field will only coalesce values inside grouped values of the previous column
   */
  coalesce: string[];
};

const TherapeuticTargetPrintTable = ({ data, columnDefs: rawColumnDefs, coalesce }: TherapeuticTargetPrintTableProps) => {
  const columnDefs = useMemo(() => rawColumnDefs.filter(({ colId, field, hide }) => {
    if (hide) return false;
    if (colId) return !COLUMNDEFS_TO_IGNORE.includes(colId);
    if (field) return !COLUMNDEFS_TO_IGNORE.includes(field);
    return true;
  }), [rawColumnDefs]);

  const sortedData = [...data].sort((a, b) => a.rank - b.rank);
  const spanMap = mergeCells(sortedData, coalesce);

  return (
    <div className="print-table__container">
      <table className="print-table therapeutic-targets__table" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead className="print-table__header">
          <tr>
            {columnDefs.map((col) => (
              <th key={col.headerName || col.field || col.colId}>
                {col.headerName || col.field || col.colId || ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr className="print-table__row" key={row.ident || rowIndex}>
              {columnDefs.map((col, colIndex) => {
                const cellValue = getCellValue(row, col);
                const spanKey = `${rowIndex}-${col.colId || col.field || col.headerName}`;
                const span = spanMap[spanKey];

                if (span !== undefined) {
                  if (span > 0) {
                    return (
                      <td key={spanKey + colIndex.toString()} rowSpan={span}>
                        {cellValue}
                      </td>
                    );
                  }
                  return (
                    <td
                      key={spanKey + colIndex.toString()}
                      style={{ display: 'none' }}
                    >
                      {cellValue}
                    </td>
                  );
                }
                return (
                  <td key={spanKey + colIndex.toString()}>
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TherapeuticTargetPrintTable;
