import React, {
  useRef, useState, useEffect, useCallback, useContext,
} from 'react';
import { AgGridReact } from '@ag-grid-community/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef } from '@ag-grid-community/core';
import useGrid from '@/hooks/useGrid';
import {
  Typography,
  IconButton,
  Switch,
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import GetAppIcon from '@material-ui/icons/GetApp';

import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import ColumnPicker from './components/ColumnPicker';
import EnsemblCellRenderer from './components/EnsemblCellRenderer';
import CivicCellRenderer from './components/CivicCellRenderer';
import GeneCellRenderer from './components/GeneCellRenderer';
import ActionCellRenderer from './components/ActionCellRenderer';
import { getDate } from '../../utils/date';

import './index.scss';

const MAX_VISIBLE_ROWS = 12;
const MAX_TABLE_HEIGHT = '517px';

type DataTableProps = {
  /* Data populating table */
  rowData: Record<string, unknown>[];
  /* Callback function when rowData is changed within the DataTable */
  onRowDataChanged?: (rows: Record<string, unknown>[]) => void;
  /* Column definitions for rowData */
  columnDefs: ColDef[];
  /* Table title */
  titleText?: string;
  /* String to filter rows by */
  filterText?: string;
  /* Can rows be edited? */
  canEdit?: boolean;
  /* Callback function when edit is started */
  onEdit?: (row: Record<string, unknown>) => void;
  /* Can rows be deleted? */
  canDelete?: boolean;
  /* Callback function when delete is called */
  onDelete?: (row: Record<string, unknown>) => void;
  /* Can rows be added to the table? */
  canAdd?: boolean;
  /* Callback function when add is called */
  onAdd?: (row: Record<string, unknown>) => void;
  /* Text shown next to the add row button */
  addText?: string;
  /* Needed for updating therapeutic tables
     therapeutic or chemoresistance
  */
  tableType?: string;
  /* List of column names that are visible */
  visibleColumns?: string[];
  /* Callback to sync multiple tables */
  syncVisibleColumns?: (visible: string[]) => void;
  /* Can the visible columns be toggled? */
  canToggleColumns?: boolean;
  /* Can the row details be viewed? */
  canViewDetails?: boolean;
  /* Should the table be paginated? */
  isPaginated?: boolean;
  /* Should the table span the whole container? */
  isFullLength?: boolean;
  /* Can the rows be reordered? */
  canReorder?: boolean;
  /* Callback when a row is reordered */
  onReorder?: (newRow: Record<string, unknown>, newRank: number, tableType?: string) => void;
  /* Can the table rows be exported? */
  canExport?: boolean;
  /* Is the table being rendered for printing? */
  isPrint?: boolean;
  /* Row index to highlight */
  highlightRow?: number;
  /* Custom header cell renderer */
  Header?: ({ displayName: string }) => JSX.Element;
  /* Text to render in an info bubble below the table header and above the table itself */
  demoDescription?: string,
};

const DataTable = ({
  rowData = [],
  onRowDataChanged,
  columnDefs,
  titleText,
  filterText,
  canEdit,
  onEdit,
  canDelete,
  onDelete,
  canAdd,
  onAdd,
  addText,
  tableType,
  visibleColumns = [],
  syncVisibleColumns,
  canToggleColumns,
  canViewDetails = true,
  isPaginated = true,
  isFullLength,
  canReorder,
  onReorder,
  canExport,
  isPrint,
  highlightRow = null,
  Header,
  demoDescription = '',
}: DataTableProps): JSX.Element => {
  const domLayout = isPrint ? 'print' : 'autoHeight';
  const { gridApi, colApi, onGridReady } = useGrid();
  const { report } = useContext(ReportContext);

  const gridDiv = useRef();
  const gridRef = useRef();

  const [showPopover, setShowPopover] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [columnDisplayNames, setColumnDisplayNames] = useState<string[]>([]);

  const defaultColDef = {
    sortable: !showReorder,
    resizable: true,
    filter: !showReorder,
    editable: false,
    valueFormatter: (params) => (params.value === null ? '' : params.value),
  };

  useEffect(() => {
    if (gridApi) {
      gridApi.setQuickFilter(filterText);
    }
  }, [filterText, gridApi]);

  // Triggers when syncVisibleColumns is called
  useEffect(() => {
    if (colApi && visibleColumns.length) {
      const allCols = colApi.getAllColumns().map((col) => col.colId);
      const hiddenColumns = allCols.filter((col) => !visibleColumns.includes(col));
      colApi.setColumnsVisible(visibleColumns, true);
      colApi.setColumnsVisible(hiddenColumns, false);
    }
  }, [colApi, visibleColumns]);

  useEffect(() => {
    if (gridApi) {
      if (highlightRow !== null) {
        const rowNode = gridApi.getDisplayedRowAtIndex(highlightRow);
        const pageSize = gridApi.paginationGetPageSize();
        const navigateToPage = Math.floor((highlightRow) / pageSize);
        
        if (navigateToPage !== gridApi.paginationGetCurrentPage()) {
          gridApi.paginationGoToPage(navigateToPage);
        }

        rowNode.setSelected(true, true);
        gridApi.ensureIndexVisible(highlightRow, 'middle');

        const [element] = document.querySelectorAll('div[class="report__content"]');
        element.scrollTo({
          top: gridRef.current.eGridDiv.offsetTop,
          left: 0,
          behavior: 'smooth',
        });
      } else {
        const selected = gridApi.getSelectedNodes();
        if (selected && selected.length) {
          selected.forEach((node) => node.setSelected(false));
        }
      }
    }
  }, [gridApi, highlightRow]);

  useEffect(() => {
    if (colApi) {
      const names = colApi.getAllColumns()
        .filter((col) => col.colId !== 'Actions')
        .map((col) => {
          const parent = col.getOriginalParent();
          if (parent && parent.colGroupDef.headerName) {
            const parentName = parent.colGroupDef.headerName;
            col.name = `${parentName} ${colApi.getDisplayNameForColumn(col)}`;
          } else {
            col.name = colApi.getDisplayNameForColumn(col);
          }
          return col;
        });
      setColumnDisplayNames(names);
    }
  }, [colApi]);

  const onFirstDataRendered = () => {
    if (syncVisibleColumns) {
      const hiddenColumns = colApi.getAllColumns()
        .map((col) => col.colId)
        .filter((col) => !visibleColumns.includes(col));

      colApi.setColumnsVisible(visibleColumns, true);
      colApi.setColumnsVisible(hiddenColumns, false);
    }

    if (rowData.length >= MAX_VISIBLE_ROWS && !isPrint && !isFullLength) {
      gridDiv.current.style.height = MAX_TABLE_HEIGHT;
      gridApi.setDomLayout('normal');
    }

    if (isFullLength) {
      gridDiv.current.style.height = '100%';
      gridDiv.current.style.flex = '1';
      gridApi.setDomLayout('normal');
    }

    if (isPrint) {
      const newCols = columnDefs.map((col) => ({
        ...col,
        wrapText: true,
        autoHeight: true,
        cellClass: ['cell-wrap-text', 'cell-line-height'],
        cellStyle: { 'white-space': 'normal' },
      }));
      gridApi.setColumnDefs(newCols);
      colApi.setColumnVisible('Actions', false);
      gridApi.sizeColumnsToFit();
    }

    if (colApi && !isFullLength) {
      const visibleColumnIds = colApi.getAllColumns()
        .filter((col) => !col.flex && col.visible)
        .map((col) => col.colId);
      colApi.autoSizeColumns(visibleColumnIds);
    } if (isFullLength) {
      gridApi.sizeColumnsToFit();
    }
  };

  const toggleReorder = useCallback(() => {
    if (!showReorder) {
      columnDefs.forEach((col) => {
        col.sortable = false;
        col.filter = false;
      });
      gridApi.setSortModel([{ colId: 'rank', sort: 'asc' }]);
      gridApi.setColumnDefs(columnDefs);

      colApi.setColumnVisible('drag', true);
      setShowReorder(true);
    } else {
      columnDefs.forEach((col) => {
        col.sortable = true;
        col.filter = true;
      });
      gridApi.setColumnDefs(columnDefs);

      colApi.setColumnVisible('drag', false);
      setShowReorder(false);
    }
  }, [colApi, columnDefs, gridApi, showReorder]);

  const onRowDragEnd = useCallback(async (event) => {
    onReorder(event.node.data, event.overIndex, tableType);
  }, [onReorder, tableType]);

  const handlePopoverClose = useCallback((returnedVisibleCols) => {
    returnedVisibleCols.push('Actions');
    const returnedHiddenCols = colApi.getAllColumns()
      .map((col) => col.colId)
      .filter((col) => !returnedVisibleCols.includes(col));

    colApi.setColumnsVisible(returnedVisibleCols, true);
    colApi.setColumnsVisible(returnedHiddenCols, false);

    colApi.autoSizeColumns(returnedVisibleCols);
    
    if (syncVisibleColumns) {
      syncVisibleColumns(returnedVisibleCols);
    }
    setShowPopover(false);
  }, [colApi, syncVisibleColumns]);

  const RowActionCellRenderer = (row) => {
    const handleEdit = useCallback(() => {
      onEdit(row.node.data);
    }, [row]);

    const handleDelete = useCallback(() => {
      onDelete(row.node.data);
    }, [row]);

    return (
      <ActionCellRenderer
        onEdit={handleEdit}
        onDelete={handleDelete}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...row}
      />
    );
  };

  const handleCSVExport = useCallback(() => {
    const date = getDate();

    gridApi.exportDataAsCsv({
      suppressQuotes: true,
      columnSeparator: '\t',
      columnKeys: colApi.getAllDisplayedColumns()
        .filter((col) => col.name !== 'Actions' && col.colId !== 'Actions')
        .map((col) => col.colId),
      fileName: `ipr_${report.patientId}_${report.ident}_${titleText.split(' ').join('_')}_${date}.tsv`,
      processCellCallback: (({ value }) => (typeof value === 'string' ? value?.replace(/,/g, '') : value)),
    });
  }, [colApi, gridApi, report, titleText]);

  const handleFilterAndSortChanged = useCallback(() => {
    if (onRowDataChanged) {
      const newRows = [];
      gridApi.forEachNodeAfterFilterAndSort((node) => {
        newRows.push(node.data);
      });
      onRowDataChanged(newRows);
    }
  }, [gridApi, onRowDataChanged]);

  return (
    <div className="data-table--padded" style={{ height: isFullLength ? '100%' : '' }}>
      {Boolean(rowData.length) || canEdit ? (
        <>
          {titleText && (
            <div className="data-table__header-container">
              <Typography variant="h3" className="data-table__header">
                {titleText}
              </Typography>
              <div>
                {canAdd && !isPrint && (
                  <span className="data-table__action">
                    <Typography display="inline">
                      {addText || 'Add row'}
                    </Typography>
                    <IconButton
                      onClick={() => onAdd(tableType ? { type: tableType } : null)}
                      title="Add Row"
                      className="data-table__icon-button"
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </span>
                )}
                {canToggleColumns && !isPrint && (
                  <span className="data-table__action">
                    <IconButton
                      onClick={() => setShowPopover((prevVal) => !prevVal)}
                      className="data-table__icon-button"
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  </span>
                )}
                {canExport && !isPrint && (
                  <span className="data-table__action">
                    <Typography display="inline">
                      Export to TSV
                    </Typography>
                    <IconButton
                      onClick={handleCSVExport}
                      title="Export to CSV"
                      className="data-table__icon-button"
                    >
                      <GetAppIcon />
                    </IconButton>
                  </span>
                )}
                {canReorder && !isPrint && (
                  <span className="data-table__action">
                    <Typography display="inline">
                      Reorder Rows
                    </Typography>
                    <Switch
                      checked={showReorder}
                      onChange={toggleReorder}
                      color="primary"
                      title="Reorder Rows"
                    />
                  </span>
                )}
              </div>
            </div>
          )}
          {Boolean(demoDescription) && (
            <DemoDescription>
              {demoDescription}
            </DemoDescription>
          )}
          <div
            className="ag-theme-material data-table__container"
            ref={gridDiv}
          >
            <ColumnPicker
              className="data-view__options-menu"
              label="Configure Visible Columns"
              columns={columnDisplayNames}
              onClose={handlePopoverClose}
              isOpen={showPopover}
            />
            <AgGridReact
              ref={gridRef}
              columnDefs={columnDefs}
              rowData={rowData}
              data-testid="grid"
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              domLayout={domLayout}
              pagination={isPaginated}
              paginationAutoPageSize={isFullLength}
              paginationPageSize={MAX_VISIBLE_ROWS}
              autoSizePadding={0}
              deltaRowDataMode={canReorder}
              getRowNodeId={(data) => data.ident}
              onRowDragEnd={canReorder ? onRowDragEnd : null}
              editType="fullRow"
              onFilterChanged={handleFilterAndSortChanged}
              onSortChanged={handleFilterAndSortChanged}
              context={{
                canEdit,
                canDelete,
                canViewDetails,
                tableType,
              }}
              frameworkComponents={{
                EnsemblCellRenderer,
                CivicCellRenderer,
                GeneCellRenderer,
                ActionCellRenderer: RowActionCellRenderer,
                headerCellRenderer: Header,
              }}
              suppressAnimationFrame
              suppressColumnVirtualisation
              disableStaticMarkup // See https://github.com/ag-grid/ag-grid/issues/3727
              onFirstDataRendered={onFirstDataRendered}
            />
          </div>
        </>
      ) : (
        <>
          <div className="data-table__header-container">
            <Typography variant="h3" className="data-table__header">
              {titleText}
            </Typography>
          </div>
          {Boolean(demoDescription) && (
            <DemoDescription>
              {demoDescription}
            </DemoDescription>
          )}
          <div className="data-table__container">
            <Typography variant="body1" align="center">
              No data to display
            </Typography>
          </div>
        </>
      )}
    </div>
  );
};

export default DataTable;
