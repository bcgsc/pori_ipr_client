import React, {
  useCallback, useContext, useState,
} from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ColDef } from '@ag-grid-community/core';
import GetAppIcon from '@mui/icons-material/GetApp';
import {
  Typography,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import api from '@/services/api';
import useGrid from '@/hooks/useGrid';
import LaunchCell from '@/components/LaunchCell';
import { useMutation } from 'react-query';
import snackbar from '@/services/SnackbarUtils';
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
  const { colApi, onGridReady } = useGrid();
  const { setSearchText } = useContext(ParamsContext);
  const [tempSearchText, setTempSearchText] = useState('');

  const onFirstDataRendered = useCallback(() => {
    const visibleColumnIds = colApi.getAllColumns()
      .filter((col) => !col.getFlex() && col.isVisible)
      .map((col) => col.getColId());
    colApi.autoSizeColumns(visibleColumnIds);
  }, [colApi]);

  const { mutate: exportGermlineReports, isLoading: isReportsDownloading } = useMutation({
    mutationFn: async () => {
      const response = await api.get(
        '/export/germline-small-mutation-reports/batch/download?reviews=biofx',
        { raw: true },
      ).request();

      const blob = await response.blob();
      const filenameHeader = response.headers.get('Content-Disposition');
      const [, filename = 'germline_export.xlsx'] = filenameHeader.match(/filename=(.+)/) || [];

      return { blob, filename };
    },
    onSuccess: ({ blob, filename }) => {
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
    },
    onError: (err: unknown) => {
      snackbar.error(`Download error: ${err}`);
    },
  });

  const handleExport = useCallback(() => {
    exportGermlineReports();
  }, [exportGermlineReports]);

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
              className="paginated-table__field"
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
            <IconButton disabled={isReportsDownloading} onClick={handleExport} size="large">
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
        frameworkComponents={{
          checkboxCellRenderer: CheckboxCell,
          reviewFilter: ReviewFilter,
          Launch: LaunchCell,
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
