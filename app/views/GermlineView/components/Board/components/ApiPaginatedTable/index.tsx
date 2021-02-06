import React, { useCallback } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import useGrid from '@/components/hooks/useGrid';

import PaginationPanel from './components/PaginationPanel';
import CheckboxCell from './components/CheckboxCell';
import FilterBar from './components/FilterBar';

import './index.scss';

type ApiPaginatedTableProps = {
  columnDefs: Record<string, unknown>[],
  rowData: Record<string, unknown>[],
  totalRows: number,
}

const ApiPaginatedTable = ({
  columnDefs,
  rowData,
  totalRows,
}: ApiPaginatedTableProps): JSX.Element => {
  const { colApi, onGridReady } = useGrid();

  const onFirstDataRendered = useCallback(() => {
    const visibleColumnIds = colApi.getAllColumns()
      .filter(col => !col.flex && col.visible)
      .map(col => col.colId);
    colApi.autoSizeColumns(visibleColumnIds);
  }, [colApi]);

  return (
    <div className="ag-theme-material paginated-table__container">
      <FilterBar />
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
