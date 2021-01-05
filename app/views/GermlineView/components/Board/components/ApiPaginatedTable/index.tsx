import React, { useCallback } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { useGrid } from '@bcgsc/react-use-grid';

import PaginationPanel from './components/PaginationPanel';
import CheckboxCell from './components/CheckboxCell';

import './index.scss';

type props = {
  columnDefs: Record<string, unknown>[],
  rowData: Record<string, unknown>[],
  totalRows: number,
}

const ApiPaginatedTable = ({
  columnDefs,
  rowData,
  totalRows,
}: props): JSX.Element => {
  const { colApi, onGridReady } = useGrid();

  const onFirstDataRendered = useCallback(() => {
    const visibleColumnIds = colApi.getAllColumns()
      .filter(col => !col.flex && col.visible)
      .map(col => col.colId);
    colApi.autoSizeColumns(visibleColumnIds);
  }, [colApi]);

  return (
    <div className="ag-theme-material paginated-table__container">
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        frameworkComponents={{
          checkboxCellRenderer: CheckboxCell,
        }}
        suppressAnimationFrame
        suppressColumnVirtualisation
        disableStaticMarkup // See https://github.com/ag-grid/ag-grid/issues/3727
      />
      <PaginationPanel
        totalRows={totalRows}
      />
    </div>
  );
};

export default ApiPaginatedTable;
