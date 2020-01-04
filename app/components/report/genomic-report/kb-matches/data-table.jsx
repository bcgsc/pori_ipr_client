import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {
  Typography,
  Popover,
  IconButton,
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
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
    arrayLinkColumns,
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

  const renderLinkArray = list => (
    <>
      {list.map(val => (
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
      ))}
    </>
  );

  const renderStringArray = list => (
    <>
      {list.map(val => (
        <div key={val}>
          {val}
          <br />
        </div>
      ))}
    </>
  );

  const [numRowsVisible, setNumRowsVisible] = useState(2);

  const expandRow = (cellParams, length) => {
    const DEFAULT_LINE_HEIGHT = 46;
    const rowNode = gridApi.current.getDisplayedRowAtIndex(
      cellParams.rowIndex,
    );

    // numRowsVisible Effect hook adjusts visible array entries
    setNumRowsVisible(length);
    rowNode.setRowHeight(length * DEFAULT_LINE_HEIGHT);
    gridApi.current.onRowHeightChanged();
  };

  const cellRendererFunc = (field, isExpanded, isLink) => {
    if (isLink) {
      if (isExpanded) {
        return (cellParams) => {
          const columnArray = [...cellParams.data[field]].sort();
          return renderLinkArray(columnArray);
        };
      }
      return (cellParams) => {
        const columnArray = [...cellParams.data[field]].sort();
        return renderLinkArray(columnArray);
      };
    }

    if (isExpanded) {
      return (cellParams) => {
        const columnArray = [...cellParams.data[field]].sort();
        return renderStringArray(columnArray);
      };
    }
    return (cellParams) => {
      const columnArray = [...cellParams.data[field]].sort();

      return (
        <div>
          {/* Show initial 2 rows and button */}
          {columnArray.map((val, index) => (
            <div key={val}>
              {index < numRowsVisible && (
                <div key={val} className="table__list-cell">
                  {val}
                  {index === 1 && columnArray.length > 2 && (
                    <MoreHorizIcon
                      color="action"
                      onClick={() => expandRow(cellParams, columnArray.length)}
                    />
                  )}
                  <br />
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };
  };


  useEffect(() => {
    const arrayColumnsIndeces = arrayColumns.map(
      col => columnDefs.findIndex(c => c.field === col),
    ).filter(index => index !== -1);

    const arrayLinkColumnsIndeces = arrayLinkColumns.map(
      col => columnDefs.findIndex(c => c.field === col),
    ).filter(index => index !== -1);

    if (numRowsVisible > 2 && arrayColumnsIndeces.length) {
      arrayColumnsIndeces.forEach((index) => {
        const { field } = columnDefs[index];
        columnDefs[index].cellRendererFramework = cellRendererFunc(
          field,
          true,
          false,
        );
        gridApi.current.setColumnDefs(columnDefs);
      });
    }

    if (numRowsVisible > 2 && arrayLinkColumnsIndeces.length) {
      arrayLinkColumnsIndeces.forEach((index) => {
        const { field } = columnDefs[index];
        columnDefs[index].cellRendererFramework = cellRendererFunc(
          field,
          true,
          true,
        );
        gridApi.current.setColumnDefs(columnDefs);
      });
    }
  }, [numRowsVisible]);

  const onGridReady = (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    columnApi.current.setColumnsVisible(visibleCols, true);
    columnApi.current.setColumnsVisible(hiddenCols, false);
    columnApi.current.autoSizeColumns(visibleCols);

    // Add custom renderer to columns with array<string> data type
    // Denoted with inclusion in arrayColumns
    const arrayColumnsIndeces = arrayColumns.map(
      col => columnDefs.findIndex(c => c.field === col),
    ).filter(index => index !== -1);

    if (arrayColumnsIndeces.length) {
      arrayColumnsIndeces.forEach((index) => {
        const { field } = columnDefs[index];
        columnDefs[index].cellRendererFramework = cellRendererFunc(
          field,
          numRowsVisible > 2,
          false,
        );
        gridApi.current.setColumnDefs(columnDefs);
      });
    }

    // Add custom renderer to columns with array<string> data type
    // AND the need for the contents to be a link
    // Denoted with inclusion in arrayLinkColumns
    const arrayLinkColumnsIndeces = arrayLinkColumns.map(
      col => columnDefs.findIndex(c => c.field === col),
    ).filter(index => index !== -1);

    if (arrayLinkColumnsIndeces.length) {
      arrayLinkColumnsIndeces.forEach((index) => {
        const { field } = columnDefs[index];
        columnDefs[index].cellRendererFramework = cellRendererFunc(
          field,
          numRowsVisible > 2,
          true,
        );
        gridApi.current.setColumnDefs(columnDefs);
      });
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
  
  const getRowHeight = (params) => {
    const DEFAULT_LINE_HEIGHT = 46;
    const DEFAULT_ROW_HEIGHT = 50;
    try {
      let upperVal = params.data.disease.size > params.data.reference.size
        ? params.data.disease.size
        : params.data.reference.size;
      // Hide more values by default. Only show 2 rows
      if (upperVal > 2) {
        upperVal = 2;
      }
      return upperVal * DEFAULT_LINE_HEIGHT;
    } catch (err) {
      return DEFAULT_ROW_HEIGHT;
    }
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
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
          skipHeaderOnAutoSize
          autoSizePadding="0"
          getRowHeight={getRowHeight}
        />
      </div>
    </div>
  );
}

ReportsTableComponent.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  arrayColumns: PropTypes.arrayOf(PropTypes.string),
  arrayLinkColumns: PropTypes.arrayOf(PropTypes.string),
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
  arrayLinkColumns: [],
};

export default ReportsTableComponent;
