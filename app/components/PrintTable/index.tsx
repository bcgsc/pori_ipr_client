import React, { useCallback } from 'react';
import { ColDef } from 'ag-grid-community';
import { Typography } from '@material-ui/core';

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

const PrintTable = ({
  data = [],
  columnDefs = [],
  order = [],
  noRowsText = '',
}: PrintTableProps): JSX.Element => {
  const rowSortFunc = useCallback(([keyA], [keyB]): number => {
    const colA = columnDefs.find((col) => col.colId === keyA);
    const colB = columnDefs.find((col) => col.colId === keyB);

    let indexA = order.findIndex((key) => key === colA?.headerName);
    let indexB = order.findIndex((key) => key === colB?.headerName);

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
  }, [columnDefs, order]);

  const headerSortFunc = useCallback((columnA, columnB): number => {
    let indexA = order.findIndex((key) => key === columnA.headerName && columnA.colId);
    let indexB = order.findIndex((key) => key === columnB.headerName && columnB.colId);

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
  }, [columnDefs.length, order]);

  return (
    <div>
      {Boolean(columnDefs.length) && (
        <table className="table">
          <thead className="table__header">
            <tr>
              {columnDefs.sort(headerSortFunc).map((col) => (
                <th key={col.headerName}>
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              <>
                {data.map((val, index) => (
                  <tr key={index} className="table__row">
                    {Object.entries(val).sort(rowSortFunc).map(([key, value]) => (
                      <td key={key}>
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td className="table__none" colSpan={columnDefs.length}>
                  {`${noRowsText || 'No Rows To Show'}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PrintTable;
