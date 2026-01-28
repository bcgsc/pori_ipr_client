import React, {
  useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { ColDef } from '@ag-grid-community/core';
import { TherapeuticDataTableType } from '../../types';

const getCellValue = (row, col) => {
  if (col.valueGetter) return col.valueGetter({ data: row });
  for (const key of [col.colId, col.field, col.headerName]) {
    if (key && row[key] !== undefined) return row[key];
  }
  return '';
};

const mergeCells = (sortedData: unknown[], colDefs: ColDef[], coalesce: string[]) => {
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
        valueGetter: colDefs[colIndex]?.valueGetter,
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
            valueGetter: colDefs[colIndex]?.valueGetter,
          }) === getCellValue(row, {
            colId: previousColumnKey,
            field: previousColumnKey,
            headerName: previousColumnKey,
            valueGetter: colDefs[colIndex]?.valueGetter,
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
  const tableRef = useRef<HTMLTableElement>(null);
  const [colWidths, setColWidths] = useState<number[] | null>(
    () => rawColumnDefs.filter(({ hide }) => !hide).map(({ width }) => width),
  );

  const columnDefs = useMemo(() => rawColumnDefs.filter(({ colId, field, hide }) => {
    if (hide) return false;
    if (colId) return !COLUMNDEFS_TO_IGNORE.includes(colId);
    if (field) return !COLUMNDEFS_TO_IGNORE.includes(field);
    return true;
  }), [rawColumnDefs]);

  useLayoutEffect(() => {
    if (!data?.length) { return undefined; }
    if (!tableRef.current || colWidths.some((w) => w > 0)) return undefined;

    const table = tableRef.current;
    const row = table.tBodies[0]?.rows[0];
    if (!row) return undefined;

    const ro = new ResizeObserver((observerEntries) => {
      const [{ target }] = observerEntries;
      const { cells } = target as HTMLTableRowElement;
      let remainingWidth = Number(target.getBoundingClientRect().width.toFixed(2));
      const widths = Array.from(cells).map((cell) => {
        const cellWidth = Number(cell.getBoundingClientRect().width.toFixed(2));
        remainingWidth -= cellWidth;
        return cellWidth;
      });
      widths[widths.length - 1] += Number(remainingWidth.toFixed(2));

      if (widths.every((w) => w > 0)) {
        setColWidths(widths);
        ro.disconnect();
      }
    });

    ro.observe(row);

    return () => ro.disconnect();
  }, [colWidths, tableRef, data]);

  const tableRows = useMemo(() => {
    const sortedData = [...data].sort((a, b) => a.rank - b.rank);
    const spanMap = mergeCells(sortedData, columnDefs, coalesce);

    if (!spanMap || !sortedData?.length) {
      return (
        <tr className="print-table__row">
          <td colSpan={columnDefs.length} align="center">
            No data available
          </td>
        </tr>
      );
    }

    return sortedData.map((row, rowIndex) => (
      <tr className="print-table__row" key={row.ident || rowIndex}>
        {columnDefs.map((colDef, colIndex) => {
          const cellValue = getCellValue(row, colDef);
          const spanKey = `${rowIndex}-${colDef.colId || colDef.field || colDef.headerName}`;
          const span = spanMap[spanKey];
          if (colWidths[colIndex] > 0) {
            return (
              <td
                key={spanKey + colIndex.toString()}
                rowSpan={span && span > 1 ? span : undefined}
                style={span === 0 ? { display: 'none' } : undefined}
                width={colWidths[colIndex]}
              >
                {cellValue}
              </td>
            );
          }
          return (
            <td
              key={spanKey + colIndex.toString()}
              rowSpan={span && span > 1 ? span : undefined}
              style={span === 0 ? { display: 'none' } : undefined}
            >
              {cellValue}
            </td>
          );
        })}
      </tr>
    ));
  }, [coalesce, columnDefs, data, colWidths]);

  return (
    <div className="print-table__container">
      <table
        ref={tableRef}
        className="print-table therapeutic-targets__table"
        style={{
          width: '100%',
        }}
      >
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
          {tableRows}
        </tbody>
      </table>
    </div>
  );
};

export default TherapeuticTargetPrintTable;
