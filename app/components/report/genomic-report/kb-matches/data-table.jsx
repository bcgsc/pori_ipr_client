import React, {
  useRef,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {
  Button,
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
 * @property {array} props.rowData table row data
 * @property {array} props.columnDefs column definitions for ag-grid
 * @property {object} props.$state angularjs state service
 * @return {*} JSX
 */
function ReportsTableComponent(props) {
  const {
    rowData,
    columnDefs,
    title,
  } = props;

  const gridApi = useRef();
  const columnApi = useRef();
  const optionsMenuOnClose = useRef();

  const setOptionsMenuOnClose = (ref) => {
    optionsMenuOnClose.current = ref;
  };

  const [moreIconEl, setMoreIconEl] = useState(null);
  const [showPopover, setShowPopover] = useState(false);

  const onGridReady = (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    gridApi.current.sizeColumnsToFit();
    window.addEventListener('resize', () => gridApi.current.sizeColumnsToFit());
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
          const { visibleCols, hiddenCols } = optionsMenuOnClose.current();
          columnApi.current.setColumnsVisible(visibleCols, true);
          columnApi.current.setColumnsVisible(hiddenCols, false);
          gridApi.current.sizeColumnsToFit();

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

  return (
    <div>
      {/* <Typography variant="h6" className="kb-matches__header">
        Therapies Approved In This Cancer Type
      </Typography>
      <div className="ag-theme-material kb-matches__container">
        <AgGridReact
          columnDefs={columnDefs}
          rowData={groupedApprovedThisCancer}
          defaultColDef={defaultColDef}
          onGridReady={params => initTables(params, 'thisCancer')}
          domLayout={domLayout}
        />
      </div> */}
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
        />
      </div>
      {/* {Object.entries(groupedAlterations).map(([key, alterationByType]) => (
        <div key={key}>
          <div>
            <Typography variant="h6" className="kb-matches__header">
              {`${startCase(key)} `}
              Alterations
            </Typography>
          </div>
          <div className="ag-theme-material kb-matches__container">
            <AgGridReact
              columnDefs={columnDefs}
              rowData={alterationByType}
              defaultColDef={defaultColDef}
              onGridReady={params => initTables(params, key)}
              domLayout={domLayout}
            />
          </div>
        </div>
      ))}
      <Typography variant="h6" className="kb-matches__header">
        Targeted Gene Report - Detected Alterations
      </Typography>
      <div className="ag-theme-material kb-matches__container">
        <AgGridReact
          columnDefs={targetedColDefs}
          rowData={targetedGenes}
          defaultColDef={defaultColDef}
          onGridReady={params => initTables(params, 'targeted')}
          domLayout={domLayout}
        />
      </div>
      <div className="kb-matches__button-container">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setShowUnknownAlterations(prevVal => !prevVal);
            setGroupedUnknownAlterations(coalesceEntries(unknownAlterations));
          }}
          classes={{ root: 'kb-matches__button' }}
        >
          {showUnknownAlterations ? 'Hide ' : 'Show '}
          Uncharacterized Alterations
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setShowNovelAlterations(prevVal => !prevVal);
            setGroupedNovelAlterations(coalesceEntries(novelAlterations));
          }}
          className="kb-matches__button"
        >
          {showNovelAlterations ? 'Hide ' : 'Show '}
          Alterations For Review
        </Button>
      </div>
      {showUnknownAlterations && (
        <div>
          <Typography variant="h6" className="kb-matches__header">
            Uncharacterized Alterations
          </Typography>
          <div className="ag-theme-material kb-matches__container">
            <AgGridReact
              columnDefs={columnDefs}
              rowData={groupedUnknownAlterations}
              defaultColDef={defaultColDef}
              onGridReady={params => initTables(params, 'unknown')}
              domLayout={domLayout}
            />
          </div>
        </div>
      )}
      {showNovelAlterations && (
        <div>
          <Typography variant="h6" className="kb-matches__header">
            Alterations For Review
          </Typography>
          <div className="ag-theme-material kb-matches__container">
            <AgGridReact
              columnDefs={columnDefs}
              rowData={groupedNovelAlterations}
              defaultColDef={defaultColDef}
              onGridReady={params => initTables(params, 'novel')}
              domLayout={domLayout}
            />
          </div>
        </div>
      )} */}
    </div>
  );
}

ReportsTableComponent.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowData: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired,
};

export default ReportsTableComponent;
