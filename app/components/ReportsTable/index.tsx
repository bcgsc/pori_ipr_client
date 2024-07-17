import React, { useCallback } from 'react';
import { AgGridReact } from '@ag-grid-community/react';

import useGrid from '@/hooks/useGrid';
import { ReportType } from '@/context/ReportContext';
import LaunchCell from '@/components/LaunchCell';
import NoRowsOverlay from '@/components/DataTable/components/NoRowsOverlay';
import { ToolTip } from '@/components/DataTable/components/ToolTip';
import columnDefs from './columnDefs';
import searchColumnDefs from './searchColumnDefs';

import './index.scss';

/**
 * Report table containing all reports
 */

type ReportsTableProps = {
  rowData: ReportType[];
  isSearch?: boolean;
};

const ReportsTableComponent = ({ rowData, isSearch }: ReportsTableProps): JSX.Element => {
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
      const allCols = colApi.getAllColumns().map((col) => col.getColId());
      colApi.autoSizeColumns(allCols);
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
        columnDefs={isSearch ? searchColumnDefs : columnDefs}
        defaultColDef={defaultColDef}
        enableCellTextSelection
        frameworkComponents={{
          Launch: LaunchCell,
          NoRowsOverlay,
          ToolTip,
        }}
        onGridReady={onGridReady}
        onGridSizeChanged={onGridSizeChanged}
        noRowsOverlayComponent="NoRowsOverlay"
        pagination
        paginationAutoPageSize
        rowData={rowData}
        rowSelection="single"
      />
    </div>
  );
};

export default ReportsTableComponent;
