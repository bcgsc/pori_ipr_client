import React, { useCallback } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import GetAppIcon from '@material-ui/icons/GetApp';
import {
  Typography,
  IconButton,
} from '@material-ui/core';

import germlineDownload from '@/services/reports/germline';
import useGrid from '@/components/hooks/useGrid';
import PaginationPanel from './components/PaginationPanel';
import CheckboxCell from './components/CheckboxCell';
import ReviewFilter from './components/ReviewFilter';

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
  const { gridApi, colApi, onGridReady } = useGrid();
  const history = useHistory();
  const snackbar = useSnackbar();

  const onFirstDataRendered = useCallback(() => {
    const visibleColumnIds = colApi.getAllColumns()
      .filter(col => !col.flex && col.visible)
      .map(col => col.colId);
    colApi.autoSizeColumns(visibleColumnIds);
  }, [colApi]);

  const onRowClicked = useCallback(({ event }) => {
    const selectedRow = gridApi.getSelectedRows();
    const [{ ident }] = selectedRow;

    if (event.ctrlKey || event.metaKey) {
      window.open(`/germline/report/${ident}`, '_blank');
    } else {
      history.push({ pathname: `/germline/report/${ident}` });
    }
  }, [gridApi, history]);

  const handleExport = useCallback(async () => {
    try {
      const { filename, blob } = await germlineDownload();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;

      const clickHandler = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.removeEventListener('click', clickHandler);
        }, 150);
      };

      a.addEventListener('click', clickHandler, false);

      a.click();
    } catch (err) {
      snackbar.enqueueSnackbar(`Download error: ${err}`);
    }
  }, [snackbar]);

  return (
    <div className="ag-theme-material paginated-table__container">
      <div className="paginated-table__header">
        <Typography variant="h3">Germline Reports</Typography>
        <div className="paginated-table__action">
          <Typography display="inline">Download Export</Typography>
          <IconButton onClick={handleExport}>
            <GetAppIcon />
          </IconButton>
        </div>
      </div>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        disableStaticMarkup // See https://github.com/ag-grid/ag-grid/issues/3727
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        onRowClicked={onRowClicked}
        frameworkComponents={{
          checkboxCellRenderer: CheckboxCell,
          reviewFilter: ReviewFilter,
        }}
        suppressAnimationFrame
        suppressColumnVirtualisation
        rowSelection="single"
      />
      <PaginationPanel
        totalRows={totalRows}
      />
    </div>
  );
};

export default ApiPaginatedTable;
