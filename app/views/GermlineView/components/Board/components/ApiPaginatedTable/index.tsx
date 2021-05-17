import React, {
  useCallback, useContext, useState,
} from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { RowClickedEvent, ColDef } from '@ag-grid-community/core';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import GetAppIcon from '@material-ui/icons/GetApp';
import {
  Typography,
  IconButton,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import api from '@/services/api';
import useGrid from '@/hooks/useGrid';
import PaginationPanel from './components/PaginationPanel';
import CheckboxCell from './components/CheckboxCell';
import ReviewFilter from './components/ReviewFilter';
import ParamsContext from '../ParamsContext';

import './index.scss';

type ApiPaginatedTableProps = {
  columnDefs: ColDef[],
  rowData: Record<string, unknown>[],
  totalRows: number,
};

const ApiPaginatedTable = ({
  columnDefs,
  rowData,
  totalRows,
}: ApiPaginatedTableProps): JSX.Element => {
  const { gridApi, colApi, onGridReady } = useGrid();
  const history = useHistory();
  const snackbar = useSnackbar();
  const { setSearchText } = useContext(ParamsContext);
  const [tempSearchText, setTempSearchText] = useState('');

  const onFirstDataRendered = useCallback(() => {
    const visibleColumnIds = colApi.getAllColumns()
      .filter((col: ColDef) => !col.flex && col.visible)
      .map((col: ColDef) => col.colId);
    colApi.autoSizeColumns(visibleColumnIds);
  }, [colApi]);

  const onRowClicked = useCallback(({ event }: RowClickedEvent): void => {
    // don't navigate if a checkbox is clicked
    if (event.target.localName === 'input') {
      return;
    }
    const selectedRow = gridApi.getSelectedRows();
    const [{ ident }] = selectedRow;

    if (event.ctrlKey || event.metaKey) {
      window.open(`/germline/report/${ident}`, '_blank');
    } else {
      history.push({ pathname: `/germline/report/${ident}` });
    }
  }, [gridApi, history]);

  const handleExport = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get(
        '/export/germline-small-mutation-reports/batch/download?reviews=biofx,projects',
        {},
      ).request();
      const blob = await response.blob();
      const filenameHeader = response.headers.get('Content-Disposition');
      const [, filename = 'germline_export.xlsx'] = filenameHeader.match(/filename=(.+)/) || [];

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearchText(event.target.value);
  };

  const handleSearchSubmit = useCallback(() => {
    setSearchText(tempSearchText);
  }, [setSearchText, tempSearchText]);

  const handleSearchSubmitKeyPress = useCallback((event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      setSearchText(tempSearchText);
    }
  }, [setSearchText, tempSearchText]);

  return (
    <div className="ag-theme-material paginated-table__container">
      <div className="paginated-table__header">
        <Typography variant="h3">Germline Reports</Typography>
        <div className="paginated-table__actions">
          <div className="paginated-table__action">
            <TextField
              className="text-field-fix paginated-table__field"
              size="small"
              label="Search by Patient ID"
              variant="outlined"
              value={tempSearchText}
              onChange={handleSearchChange}
              onKeyUp={handleSearchSubmitKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearchSubmit}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className="paginated-table__action">
            <Typography display="inline">Download Export</Typography>
            <IconButton onClick={handleExport}>
              <GetAppIcon />
            </IconButton>
          </div>
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
