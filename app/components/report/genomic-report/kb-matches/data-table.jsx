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

  const onGridReady = (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    columnApi.current.setColumnsVisible(visibleCols, true);
    columnApi.current.setColumnsVisible(hiddenCols, false);
    columnApi.current.autoSizeColumns(visibleCols);
  };

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };
    
  const domLayout = 'autoHeight';

  const renderOptionsMenu = () => {
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
        onClose={() => {
          const {
            visibleCols: returnedVisibleCols,
            hiddenCols: returnedHiddenCols,
          } = optionsMenuOnClose.current();

          setVisibleCols(returnedVisibleCols);
          setHiddenCols(returnedHiddenCols);
          columnApi.current.autoSizeColumns(returnedVisibleCols);

          setShowPopover(prevVal => !prevVal);
          setMoreIconEl(null);
        }}
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
      const upperVal = params.data.disease.size > params.data.reference.size
        ? params.data.disease.size
        : params.data.reference.size;
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
};

export default ReportsTableComponent;
