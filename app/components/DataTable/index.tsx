import React, {
  useRef, useState, useEffect, useCallback, useContext, useMemo,
} from 'react';
import { AgGridReact } from '@ag-grid-community/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColDef, RowNode, RowSpanParams } from '@ag-grid-community/core';
import cloneDeep from 'lodash/cloneDeep';
import useGrid from '@/hooks/useGrid';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import { ColumnPicker, ColumnPickerProps } from './components/ColumnPicker';
import EnsemblCellRenderer from './components/EnsemblCellRenderer';
import CivicCellRenderer from './components/CivicCellRenderer';
import GeneCellRenderer from './components/GeneCellRenderer';
import ActionCellRenderer from './components/ActionCellRenderer';
import NoRowsOverlay from './components/NoRowsOverlay';
import { getDate } from '../../utils/date';

import './index.scss';

const MAX_VISIBLE_ROWS = 12;
const MAX_TABLE_HEIGHT = '517px';
const PAGE_TOP_OFFSET = 56 + 57;

/**
 * Given colDefs, calculates rowSpan for each columnDef based on the current displayedRows on the table
 */
const getRowspanColDefs = (colDefs: ColDef[], displayedRows: RowNode[], colsToCollapse: string[]): ColDef[] => {
  const nextColDefs: ColDef[] = cloneDeep(colDefs);
  const keysToRowSpan = {};
  displayedRows.forEach((row) => {
    let rowKey = '';
    colsToCollapse.forEach((colField) => {
      rowKey = rowKey.concat(row.data[colField]);
    });
    if (!keysToRowSpan[rowKey]) {
      keysToRowSpan[rowKey] = 1;
    } else {
      keysToRowSpan[rowKey] += 1;
    }
  });

  let prevRowKey = '';
  let prevRowIndex = -1;
  nextColDefs.forEach((cd) => {
    // eslint-disable-next-line no-param-reassign -- we deepcloned the coldefs, so no data pollution
    cd.rowSpan = (params) => {
      const { node: { rowIndex } } = params;

      let rowKey = '';
      colsToCollapse.forEach((colField) => {
        rowKey = rowKey.concat(params.data[colField]);
      });

      if (rowIndex !== prevRowIndex) {
        if (rowKey !== prevRowKey) {
          // New Key
          prevRowKey = rowKey;
        } else {
          // Old Key
          keysToRowSpan[rowKey] = 0;
        }
        prevRowIndex = rowIndex;
      }

      if (colsToCollapse.includes(cd.field) && keysToRowSpan[rowKey] > 0) {
        return keysToRowSpan[rowKey];
      }
      return 1;
    };

    // eslint-disable-next-line no-param-reassign
    cd.cellClass = (params) => {
      const span = params.colDef.rowSpan(params);
      const numRows = params.api.getRenderedNodes().length;
      const pageNum = params.api.paginationGetCurrentPage();
      const pageSize = params.api.paginationGetPageSize();
      if (span > 1) {
        return span + params.rowIndex - (pageNum * pageSize) === numRows ? 'cell-span--last' : 'cell-span';
      }
      return '';
    };
  });
  return nextColDefs;
};

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
  /* Column fields to collapse, this will build the key that will combine these column values to be collapsed */
  collapseColumnFields?: string[];
};

const DataTable = ({
  rowData = [],
  onRowDataChanged,
  columnDefs: colDefs,
  // columnDefs,
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
  canToggleColumns = true,
  canViewDetails = true,
  isPaginated = true,
  isFullLength,
  canReorder,
  onReorder,
  canExport = true,
  isPrint,
  highlightRow = null,
  Header,
  demoDescription = '',
  collapseColumnFields = null,
}: DataTableProps): JSX.Element => {
  const domLayout = isPrint ? 'print' : 'autoHeight';
  const { gridApi, colApi, onGridReady } = useGrid();
  const { report } = useContext(ReportContext);

  const gridDiv = useRef<HTMLDivElement>();
  const gridRef = useRef<AgGridReact>();

  const [showPopover, setShowPopover] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();
  const [showReorder, setShowReorder] = useState(false);
  const [columnWithNames, setColumnWithNames] = useState<ColumnPickerProps['columns']>([]);

  const defaultColDef = useMemo(() => ({
    sortable: !showReorder,
    resizable: true,
    filter: !showReorder,
    editable: false,
    valueFormatter: (params) => (params.value === null ? '' : params.value),
  }), [showReorder]);

  // Enhanced ColumnDefs here if rows are to be collapsed
  const columnDefs = useMemo(() => {
    let nextColDefs = colDefs;
    if (collapseColumnFields?.length > 0) {
      nextColDefs = cloneDeep(colDefs);
      nextColDefs.forEach((cd) => {
        if (collapseColumnFields.includes(cd.field)) {
        // If collapse rows are to be had, no filter or sort will be allowed
          // eslint-disable-next-line no-param-reassign
          cd.sort = 'asc';
          // eslint-disable-next-line no-param-reassign
          cd.sortable = false;
          // eslint-disable-next-line no-param-reassign
          cd.filter = false;
        } else {
          // Disable sort for the other columns, as it has uninteded actions upon sort/filter
          // eslint-disable-next-line no-param-reassign
          cd.sortable = false;
          // eslint-disable-next-line no-param-reassign
          cd.filter = false;
        }
      });
    }
    return nextColDefs;
  }, [colDefs, collapseColumnFields]);

  useEffect(() => {
    if (gridApi) {
      gridApi.setQuickFilter(filterText);
    }
  }, [filterText, gridApi]);

  // Triggers when syncVisibleColumns is called
  useEffect(() => {
    if (colApi && visibleColumns.length) {
      const allCols = colApi.getAllColumns().map((col) => col.getColId());
      const hiddenColumns = allCols.filter((col) => !visibleColumns.includes(col));
      colApi.setColumnsVisible(visibleColumns, true);
      colApi.setColumnsVisible(hiddenColumns, false);
      colApi.autoSizeColumns(visibleColumns);
    }
  }, [colApi, visibleColumns]);

  /**
   * Currently only used by Expression Correlation
   */
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
          top: gridRef.current.eGridDiv.offsetTop - PAGE_TOP_OFFSET,
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

  /**
   * Sets select visible column names
   */
  useEffect(() => {
    if (colApi) {
      const names = colApi.getAllColumns()
        .filter((col) => col.colId.toLowerCase() !== 'actions')
        .map((col) => {
          const parent = col.getOriginalParent();
          if (parent?.colGroupDef.headerName) {
            const parentName = parent.colGroupDef.headerName;
            col.name = `${parentName} ${colApi.getDisplayNameForColumn(col)}`;
          } else {
            col.name = colApi.getDisplayNameForColumn(col);
          }
          return col;
        });
      setColumnWithNames(names);
    }
  }, [colApi]);

  const onFirstDataRendered = useCallback(() => {
    if (syncVisibleColumns) {
      const hiddenColumns = colApi.getAllColumns()
        .map((col) => col.colId)
        .filter((col) => !visibleColumns.includes(col));

      colApi.setColumnsVisible(visibleColumns, true);
      colApi.setColumnsVisible(hiddenColumns, false);
    }

    if (rowData.length >= MAX_VISIBLE_ROWS && !isPrint && !isFullLength) {
      gridDiv.current.style.height = MAX_TABLE_HEIGHT;
      gridApi?.setDomLayout('normal');
    }

    if (isFullLength) {
      gridDiv.current.style.height = '100%';
      gridDiv.current.style.flex = '1';
      gridApi?.setDomLayout('normal');
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
  }, [colApi, columnDefs, gridApi, isFullLength, isPrint, rowData.length, syncVisibleColumns, visibleColumns]);

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

  const RowActionCellRenderer = useCallback((row) => (
    <ActionCellRenderer
      onEdit={() => onEdit(row.node.data)}
      onDelete={() => onDelete(row.node.data)}
      {...row}
    />
  ), [onEdit, onDelete]);

  const handleTSVExport = useCallback(() => {
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

  const handleMenuItemClick = useCallback((action) => {
    switch (action) {
      case 'add':
        onAdd(tableType ? { type: tableType } : null);
        break;
      case 'toggle':
        setShowPopover(true);
        break;
      case 'export':
        handleTSVExport();
        break;
      case 'reorder':
        toggleReorder();
        break;
      default:
        break;
    }
    setMenuAnchor(null);
  }, [handleTSVExport, onAdd, tableType, toggleReorder]);

  const handlePaginationChanged = useCallback((params) => {
    // Case for when rows are supposed to be collapsed
    if (collapseColumnFields?.length > 0 && (params.newData || params.newPage)) {
      params.api.setColumnDefs(getRowspanColDefs(columnDefs, params.api.getRenderedNodes(), collapseColumnFields));
      params.columnApi.autoSizeAllColumns();
    }
  }, [columnDefs, collapseColumnFields]);

  const visibleColumnIds = useMemo(() => {
    if (visibleColumns.length > 0) {
      return visibleColumns;
    }
    return columnWithNames.filter((col) => col.isVisible()).map((col) => col.getColId());
  }, [columnWithNames, visibleColumns]);

  return (
    <div className="data-table--padded" style={{ height: isFullLength ? '100%' : '' }}>
      {Boolean(rowData.length) || canEdit ? (
        <>
          <div className="data-table__header-container">
            {titleText && (<Typography variant="h3" className="data-table__header">{titleText}</Typography>)}
            <div>
              {(canAdd || canToggleColumns || canExport || canReorder) && (
              <span className="data-table__action">
                <IconButton
                  onClick={(event) => setMenuAnchor(event.currentTarget)}
                  className="data-table__icon-button"
                  size="large"
                >
                  <MoreHorizIcon />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                >
                  {canAdd && (
                  <MenuItem onClick={() => handleMenuItemClick('add')}>
                    {addText || 'Add row'}
                  </MenuItem>
                  )}
                  {canToggleColumns && (
                  <MenuItem onClick={() => handleMenuItemClick('toggle')}>
                    Toggle Columns
                  </MenuItem>
                  )}
                  {canExport && (
                  <MenuItem onClick={() => handleMenuItemClick('export')}>
                    Export to TSV
                  </MenuItem>
                  )}
                  {canReorder && (
                  <MenuItem onClick={() => handleMenuItemClick('reorder')}>
                    Reorder Rows
                  </MenuItem>
                  )}
                </Menu>
              </span>
              )}
            </div>
          </div>
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
              columns={columnWithNames}
              visibleColumnIds={visibleColumnIds}
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
              autoSizePadding={1}
              deltaRowDataMode={canReorder}
              getRowNodeId={(data) => data.ident}
              onRowDragEnd={canReorder ? onRowDragEnd : null}
              editType="fullRow"
              onFilterChanged={handleFilterAndSortChanged}
              onSortChanged={handleFilterAndSortChanged}
              noRowsOverlayComponent="NoRowsOverlay"
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
                NoRowsOverlay,
              }}
              suppressAnimationFrame
              suppressRowTransform={Boolean(collapseColumnFields)}
              suppressColumnVirtualisation
              disableStaticMarkup // See https://github.com/ag-grid/ag-grid/issues/3727
              onFirstDataRendered={onFirstDataRendered}
              onPaginationChanged={handlePaginationChanged}
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

export { DataTableProps };
export default DataTable;
