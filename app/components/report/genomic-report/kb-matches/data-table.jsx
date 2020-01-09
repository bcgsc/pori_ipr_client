import React, {
  useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {
  Typography,
  Popover,
  IconButton,
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import OptionsMenu from '../../../../common/options-menu';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './index.scss';

/**
 * @param {object} props props
 * @param {array} props.rowData table row data
 * @param {array} props.columnDefs column definitions for ag-grid
 * @param {object} props.$state angularjs state service
 * @return {*} JSX
 */
function ReportsTableComponent(props) {
  const {
    rowData,
    columnDefs,
    arrayColumns,
    title,
    visibleCols,
    hiddenCols,
    setVisibleCols,
    setHiddenCols,
    searchText,
  } = props;

  const gridApi = useRef();
  const columnApi = useRef();
  const optionsMenuOnClose = useRef();

  const setOptionsMenuOnClose = (ref) => {
    optionsMenuOnClose.current = ref;
  };

  const [arrayRows] = useState(
    rowData.reduce((accumulator, row, index) => {
      if (arrayColumns.some(col => [...row[col.field]].length > 1)) {
        accumulator.push(index);
      }
      return accumulator;
    }, []),
  );

  const [rowExpandedStatus, setRowExpandedStatus] = useState(
    arrayRows.map(row => ({
      row,
      status: false,
    })),
  );

  const [stateColumnDefs, setStateColumnDefs] = useState(columnDefs);
  const [moreIconEl, setMoreIconEl] = useState(null);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    if (columnApi.current) {
      columnApi.current.setColumnsVisible(visibleCols, true);
      columnApi.current.setColumnsVisible(hiddenCols, false);
    }
  }, [visibleCols, hiddenCols]);

  useEffect(() => {
    if (gridApi.current) {
      gridApi.current.setQuickFilter(searchText);
    }
  }, [searchText]);

  const toggleRowExpand = (cellParams) => {
    const DEFAULT_LINE_HEIGHT = 46;

    const rowNode = gridApi.current.getDisplayedRowAtIndex(
      cellParams.rowIndex,
    );

    setRowExpandedStatus((prevVal) => {
      const updateVal = [...prevVal];
      const rowExpandedStatusIndex = updateVal.findIndex(val => val.row === cellParams.rowIndex);
      updateVal[rowExpandedStatusIndex].status = !updateVal[rowExpandedStatusIndex].status;
      return updateVal;
    });

    const expand = rowExpandedStatus.find(
      val => val.row === cellParams.rowIndex,
    ).status;

    if (expand) {
      // Expand all hidden rows, so take the max amount of rows
      const arrayLengths = arrayColumns.map(col => [...cellParams.data[col.field]].length);
      const upperRows = Math.max(...arrayLengths);
      rowNode.setRowHeight(upperRows * DEFAULT_LINE_HEIGHT);
    } else {
      // Minimize, set back to default height
      rowNode.setRowHeight(DEFAULT_LINE_HEIGHT);
    }

    gridApi.current.onRowHeightChanged();
  };

  const cellRendererFunc = (field, isLink) => {
    if (isLink) {
      return (cellParams) => {
        const columnArray = [...cellParams.data[field]].sort();
        const [currentRowStatus] = rowExpandedStatus.filter(r => (
          r.row === cellParams.rowIndex
        )).map(r => r.status);

        return (
          <>
            {/* Show single row if current row is not expanded */}
            {columnArray.map((val, index) => (
              <div key={val}>
                {currentRowStatus && (
                  <div key={val}>
                    <a
                      href={(val.replace('#', '').match(/^\d+$/))
                        ? `https://ncbi.nlm.nih.gov/pubmed/${val.replace('#', '')}`
                        : `http://${val.replace('#', '')}`
                      }
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {val.replace('#', '')}
                    </a>
                    <br />
                  </div>
                )}
                {!currentRowStatus && (index < 1) && (
                  <div key={val}>
                    {val}
                  </div>
                )}
              </div>
            ))}
          </>
        );
      };
    }

    return (cellParams) => {
      const columnArray = [...cellParams.data[field]].sort();
      const [currentRowStatus] = rowExpandedStatus.filter(r => (
        r.row === cellParams.rowIndex
      )).map(r => r.status);

      return (
        <>
          {/* Show single row if current row is not expanded */}
          {columnArray.map((val, index) => (
            <div key={val}>
              {currentRowStatus && (
                <div key={val}>
                  {val}
                  <br />
                </div>
              )}
              {!currentRowStatus && (index < 1) && (
                <div key={val}>
                  {val}
                </div>
              )}
            </div>
          ))}
        </>
      );
    };
  };

  const renderExpandArrow = (cellParams) => {
    const [currentRowStatus] = rowExpandedStatus.filter(r => (
      r.row === cellParams.rowIndex
    )).map(r => r.status);
    const arrayLengths = arrayColumns.map(col => (
      [...cellParams.data[col.field]].length
    ));
    const upperRows = Math.max(...arrayLengths);

    if (currentRowStatus && upperRows > 1) {
      return (
        <ExpandLessIcon
          color="action"
        />
      );
    }
    if (!currentRowStatus && upperRows > 1) {
      return (
        <ExpandMoreIcon
          color="action"
        />
      );
    }
    // Only a single entry, don't return an expansion icon
    return (
      <div />
    );
  };

  useEffect(() => {
    if (arrayColumns.length && gridApi.current) {
      arrayColumns.forEach((col) => {
        setStateColumnDefs((prevVal) => {
          const updateVal = [...prevVal];
          updateVal[col.index].cellRendererFramework = cellRendererFunc(
            col.field,
            col.isLink,
          );
          return updateVal;
        });
      });

      // Update row icon
      setStateColumnDefs((prevVal) => {
        const updateVal = [...prevVal];
        updateVal[0].cellRendererFramework = renderExpandArrow;
        return updateVal;
      });
      gridApi.current.setColumnDefs(stateColumnDefs);
    }
  }, [rowExpandedStatus]);


  const onGridReady = (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    columnApi.current.setColumnsVisible(visibleCols, true);
    columnApi.current.setColumnsVisible(hiddenCols, false);
    columnApi.current.autoSizeColumns(visibleCols);

    // Add custom renderer and click handler to columns with array<string> data type
    // Denoted with inclusion in arrayColumns
    if (arrayColumns.length) {
      arrayColumns.forEach((col) => {
        setStateColumnDefs((prevVal) => {
          const updateVal = [...prevVal];
          updateVal[col.index].cellRendererFramework = cellRendererFunc(
            col.field,
            col.isLink,
          );
          return updateVal;
        });
      });

      // Add custom renderer to first column to control expanded rows
      setStateColumnDefs((prevVal) => {
        const updateVal = [...prevVal];
        updateVal[0].cellRendererFramework = renderExpandArrow;
        updateVal[0].cellClass = 'table__expand-cell';
        updateVal[0].onCellClicked = (cellParams) => {
          toggleRowExpand(cellParams);
        };
        return updateVal;
      });

      gridApi.current.setColumnDefs(stateColumnDefs);
    }
  };

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };
    
  const domLayout = 'autoHeight';

  const renderOptionsMenu = () => {
    const popoverCloseHandler = () => {
      const {
        visibleCols: returnedVisibleCols,
        hiddenCols: returnedHiddenCols,
      } = optionsMenuOnClose.current();

      setVisibleCols(returnedVisibleCols);
      setHiddenCols(returnedHiddenCols);
      columnApi.current.autoSizeColumns(returnedVisibleCols);

      setShowPopover(prevVal => !prevVal);
      setMoreIconEl(null);
    };

    const result = (
      <Popover
        anchorEl={moreIconEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        onClose={() => popoverCloseHandler()}
        open={Boolean(moreIconEl)}
      >
        <OptionsMenu
          className="data-view__options-menu"
          label="Configure Visible Columns"
          columns={columnApi.current.getAllColumns()}
          onClose={setOptionsMenuOnClose}
        />
      </Popover>
    );
    return result;
  };
  
  return (
    <div>
      <div className="kb-matches__header-container">
        <Typography variant="h6" className="kb-matches__header">
          {title}
        </Typography>
        <IconButton
          onClick={({ currentTarget }) => {
            setShowPopover(prevVal => !prevVal);
            setMoreIconEl(currentTarget);
          }}
        >
          <MoreHorizIcon />
        </IconButton>
      </div>
      <div className="ag-theme-material kb-matches__container">
        {showPopover
          && renderOptionsMenu()
        }
        <AgGridReact
          columnDefs={stateColumnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
          skipHeaderOnAutoSize
          autoSizePadding="0"
        />
      </div>
    </div>
  );
}

ReportsTableComponent.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  arrayColumns: PropTypes.arrayOf(PropTypes.object),
  rowData: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
  visibleCols: PropTypes.arrayOf(PropTypes.string).isRequired,
  hiddenCols: PropTypes.arrayOf(PropTypes.string).isRequired,
  setVisibleCols: PropTypes.func.isRequired,
  setHiddenCols: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
};

ReportsTableComponent.defaultProps = {
  rowData: [],
  arrayColumns: [],
};

export default ReportsTableComponent;
