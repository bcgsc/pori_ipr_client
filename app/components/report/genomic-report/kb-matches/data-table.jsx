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
import startCase from 'lodash.startcase';
import OptionsMenu from '../../../../common/options-menu';
import TableManager from './tableManager';
import { colDefs, targetedColDefs } from './colDefs';

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
    alterations,
    novelAlterations,
    unknownAlterations,
    approvedThisCancer,
    approvedOtherCancer,
    targetedGenes,
  } = props;

  const optionsMenuOnClose = useRef();

  const setOptionsMenuOnClose = (ref) => {
    optionsMenuOnClose.current = ref;
  };

  const [columnDefs, setColumnDefs] = useState(colDefs);
  const [moreIconEl, setMoreIconEl] = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const [showUnknownAlterations, setShowUnknownAlterations] = useState(false);
  const [showNovelAlterations, setShowNovelAlterations] = useState(false);
  const [groupedAlterations, setGroupedAlterations] = useState({});
  const [groupedApprovedThisCancer, setGroupedApprovedThisCancer] = useState([]);
  const [groupedApprovedOtherCancer, setGroupedApprovedOtherCancer] = useState([]);
  const [groupedUnknownAlterations, setGroupedUnknownAlterations] = useState([]);
  const [groupedNovelAlterations, setGroupedNovelAlterations] = useState([]);

  const coalesceEntries = entries => [...new Set(entries)];
  
  const groupCategories = (entries) => {
    const grouped = {};
    entries.forEach((row) => {
      if (!(Object.prototype.hasOwnProperty.call(grouped, row.alterationType))) {
        grouped[row.alterationType] = new Set([row]);
      } else {
        grouped[row.alterationType].add(row);
      }
    });
    Object.entries(grouped).map(group => [...group]);
    return grouped;
  };

  useEffect(() => {
    setGroupedAlterations(groupCategories(alterations));
    setGroupedApprovedThisCancer(coalesceEntries(approvedThisCancer));
    setGroupedApprovedOtherCancer(coalesceEntries(approvedOtherCancer));
  }, []);

  const tables = [
    // ...Object.keys(groupedAlterations),
    'biological',
    'therapeutic',
    'prognostic',
    'diagnostic',
    'novel',
    'unknown',
    'thisCancer',
    'otherCancer',
    'targeted',
  ];

  const [tableManager, setTableManager] = useState(new TableManager(tables));

  const initTables = (params, table) => {
    tableManager.setTableProp(table, 'gridApi', params.api);
    tableManager.setTableProp(table, 'columnApi', params.columnApi);
    tableManager.getTableProp(table, 'gridApi').sizeColumnsToFit();

    window.addEventListener('resize', () => tableManager.getTableProp(table, 'gridApi').sizeColumnsToFit());
  };


  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };
    
  const domLayout = 'autoHeight';

  const renderOptionsMenu = (table) => {
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
          const colApi = tableManager.getTableProp(table, 'columnApi');
          console.log(tableManager.getTables());
          const { visibleCols, hiddenCols } = optionsMenuOnClose.current();
          colApi.setColumnsVisible(visibleCols, true);
          colApi.setColumnsVisible(hiddenCols, false);

          setShowPopover(prevVal => !prevVal);
          setMoreIconEl(null);
        }}
        open={Boolean(moreIconEl)}
      >
        <OptionsMenu
          className="data-view__options-menu"
          label="Configure Visible Columns"
          columns={columnDefs}
          onClose={setOptionsMenuOnClose}
        />
      </Popover>
    );
    return result;
  };

  return (
    <div>
      <Typography variant="h6" className="kb-matches__header">
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
      </div>
      <div className="kb-matches__header-container">
        <Typography variant="h6" className="kb-matches__header">
          Therapies Approved In Other Cancer Types
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
          && renderOptionsMenu('otherCancer')
        }
        <AgGridReact
          columnDefs={columnDefs}
          rowData={groupedApprovedOtherCancer}
          defaultColDef={defaultColDef}
          onGridReady={params => initTables(params, 'otherCancer')}
          domLayout={domLayout}
        />
      </div>
      {Object.entries(groupedAlterations).map(([key, alterationByType]) => (
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
      )}
    </div>
  );
}

ReportsTableComponent.propTypes = {
  alterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  novelAlterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  unknownAlterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  approvedThisCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  approvedOtherCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  targetedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ReportsTableComponent;
