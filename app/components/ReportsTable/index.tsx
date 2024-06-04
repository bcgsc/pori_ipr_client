import React, { useCallback } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColumnState } from '@ag-grid-community/core';

import useGrid from '@/hooks/useGrid';
import { ReportType } from '@/context/ReportContext';
import LaunchCell from '@/components/LaunchCell';
import NoRowsOverlay from '@/components/DataTable/components/NoRowsOverlay';
import columnDefs from './columnDefs';

import './index.scss';

/**
 * Report table containing all reports
 */
const ReportsTableComponent = (reportsData: ReportType[]): JSX.Element => {
  const {
    gridApi,
    colApi,
    onGridReady,
  } = useGrid();

  const onGridSizeChanged = useCallback((params) => {
    const MEDIUM_SCREEN_WIDTH_LOWER = 992;

    if (params.clientWidth >= MEDIUM_SCREEN_WIDTH_LOWER) {
      gridApi.sizeColumnsToFit();
    } else {
      const colsToAutoSize = colApi.getAllColumns()
        .filter((col: ColumnState) => !col.pinned)
        .map((col: ColumnState) => col.colId);
      colApi.autoSizeColumns(colsToAutoSize);
    }
  }, [colApi, gridApi]);

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  return (
    <div className="ag-theme-material reports-table__container">
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        enableCellTextSelection
        frameworkComponents={{
          Launch: LaunchCell,
          NoRowsOverlay,
        }}
        onGridReady={onGridReady}
        onGridSizeChanged={onGridSizeChanged}
        noRowsOverlayComponent="NoRowsOverlay"
        pagination
        paginationAutoPageSize
        rowData={reportsData}
        rowSelection="single"
      />
    </div>
  );
};

export default ReportsTableComponent;
