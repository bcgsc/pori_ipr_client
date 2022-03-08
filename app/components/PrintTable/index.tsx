/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef, ValueGetterParams } from '@ag-grid-community/core';

import './index.scss';

type PrintTableProps = {
  data: Record<string, unknown>[];
  /* colId must be defined if sorting by order */
  columnDefs: ColDef[];
  /* order is only needed if it differs from the columnDef order */
  /* string of headerNames should be used */
  order?: string[];
  noRowsText?: string;
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
}: PrintTableProps): JSX.Element => {
  const sortedColDefs = useMemo(() => columnDefs
    .filter((col) => (col.headerName && col.hide !== true && col.headerName !== 'Actions'))
    .sort((columnA, columnB): number => {
      let indexA;
      let indexB;

      if (order?.length > 0) {
        indexA = order.findIndex((key) => key === columnA.headerName && columnA.colId);
        indexB = order.findIndex((key) => key === columnB.headerName && columnB.colId);
      } else {
        indexA = columnDefs.findIndex((col) => col.headerName === columnA.headerName && columnA.colId);
        indexB = columnDefs.findIndex((col) => col.headerName === columnB.headerName && columnB.colId);
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

  const sortedData = useMemo(() => {
    let component = (
      <tr>
        <td className="table__none" colSpan={sortedColDefs.length}>
          {`${noRowsText || 'No Rows To Show'}`}
        </td>
      </tr>
    );

    if (data.length > 0) {
      const massagedData = [];
      data.forEach((dataRow) => {
        const row = [];
        sortedColDefs.forEach((colD) => {
          const columnIdentifier = colD.colId || colD.field;
          let cellValue = dataRow[columnIdentifier];

          if (colD.valueGetter && typeof colD.valueGetter === 'function') {
            cellValue = colD.valueGetter({ data: dataRow } as ValueGetterParams);
          }
          row.push(cellValue);
        });
        massagedData.push(row);
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
    }

    return component;
  }, [sortedColDefs, noRowsText, data]);

  return (
    <div className="table-container">
      {Boolean(columnDefs.length) && (
        <table className="table">
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
            {sortedData}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PrintTable;
