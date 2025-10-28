import React, { useCallback } from 'react';
import { AgGridReact } from '@ag-grid-community/react';

import useGrid from '@/hooks/useGrid';
import { ReportType } from '@/context/ReportContext';
import LaunchCell from '@/components/LaunchCell';
import NoRowsOverlay from '@/components/DataTable/components/NoRowsOverlay';
import { getDate } from '../../utils/date';
import { ToolTip } from '@/components/DataTable/components/ToolTip';
import columnDefs from './columnDefs';

import './index.scss';
import { Fab } from '@mui/material';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

/**
 * Report table containing all reports
 */

type ReportsTableProps = {
  rowData: ReportType[];
};

const ReportsTableComponent = ({ rowData }: ReportsTableProps): JSX.Element => {
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

  const handleTSVExport = useCallback(() => {
    const date = getDate();

    const defaultFileName = `ipr_all_reports_${date}.tsv`;

    gridApi.exportDataAsCsv({
      suppressQuotes: true,
      columnSeparator: '\t',
      columnKeys: colApi.getAllDisplayedColumns()
        .filter((col) => {
          const colD = col.getColDef();
          return !(colD?.headerName === 'Actions' || colD?.field === 'Actions' || col.getColId() === 'Actions');
        })
        .map((col) => col.getColId()),
      fileName: defaultFileName,
      processCellCallback: (({ value }) => (typeof value === 'string' ? value?.replace(/,/g, '') : value)),
    });
  }, [colApi, gridApi]);

  return (
    <div className="ag-theme-material reports-table__container">
      {rowData && (
        <Fab
          className="reports-table__fab"
          color="inherit"
          onClick={handleTSVExport}
          variant="extended"
          size="small"
          style={{
            position: "fixed",
            bottom: 4,
            right: 360,
            color: "grey",
            backgroundColor: "white",
            borderRadius: 5,
            boxShadow: "none",
          }}
        >
          <SaveAltIcon sx={{ mr: 1 }}/>
          Export to TSV
        </Fab>
      )}
      <AgGridReact
        columnDefs={columnDefs}
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
