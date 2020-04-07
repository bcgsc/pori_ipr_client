import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  InputAdornment,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
} from '@material-ui/core';
import {
  FilterList,
  ExpandMore,
} from '@material-ui/icons';
import DataTable from '../../../../components/DataTable';
import { columnDefs, targetedColumnDefs } from './columnDefs';

import './index.scss';

const VISIBLE = 'visibleColsKb';

/**
 * @param {*} props props
 * @param {object} tableData table data for all tables
 * @param {object} hiddenTableData table data for all tables hidden by default
 * @param {array} syncedColumnDefs column definitions to by synced across tables
 * @returns {*} JSX
 */
function KBMatches(props) {
  const {
    syncedTableData,
    unsyncedTableData,
    hiddenTableData,
  } = props;

  const [thisHiddenTableData, setThisHiddenTableData] = useState(hiddenTableData.current);

  const [visibleColumns, setVisibleColumns] = useState(
    localStorage.getItem(VISIBLE)
      ? localStorage.getItem(VISIBLE).split(',')
      : columnDefs.filter(c => !c.hide).map(c => c.field),
  );

  const [filterText, setFilterText] = useState('');
  
  const handleFilter = event => setFilterText(event.target.value);

  const syncVisibleColumns = (visible) => {
    setVisibleColumns(visible);
    localStorage.setItem('visibleColsKb', visible);
  };

  return (
    <>
      <div className="kb-matches__filter">
        <TextField
          label="Filter Table Text"
          type="text"
          variant="outlined"
          value={filterText}
          onChange={handleFilter}
          margin="dense"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <FilterList color="action" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div>
        {Object.values(syncedTableData).map(table => (
          <DataTable
            key={table.titleText}
            columnDefs={columnDefs}
            rowData={table.rowData || []}
            titleText={table.titleText}
            visibleColumns={visibleColumns}
            syncVisibleColumns={syncVisibleColumns}
            filterText={filterText}
            edit={false}
            canToggleColumns
          />
        ))}
      </div>

      <div>
        <DataTable
          columnDefs={targetedColumnDefs}
          rowData={unsyncedTableData.rowData || []}
          titleText={unsyncedTableData.titleText}
          filterText={filterText}
          edit={false}
        />
      </div>

      {Object.values(thisHiddenTableData).map(table => (
        <div className="expansion-panel" key={table.titleText}>
          <ExpansionPanel
            TransitionProps={{ unmountOnExit: true }}
            elevation={0}
          >
            <ExpansionPanelSummary
              expandIcon={<ExpandMore />}
              classes={{ root: 'expansion-panel__summary' }}
            >
              <Typography variant="h5">
                {table.titleText}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              classes={{ root: 'expansion-panel__details' }}
            >
              <DataTable
                columnDefs={columnDefs}
                rowData={table.rowData || []}
                titleText={table.titleText}
                filterText={filterText}
                edit={false}
                canToggleColumns
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      ))}
    </>
  );
}

KBMatches.propTypes = {
  syncedTableData: PropTypes.objectOf(
    PropTypes.shape({
      titleText: PropTypes.string,
      rowData: PropTypes.array,
    }),
  ),
  unsyncedTableData: PropTypes.shape({
    titleText: PropTypes.string,
    rowData: PropTypes.array,
  }),
  hiddenTableData: PropTypes.objectOf(
    PropTypes.objectOf(
      PropTypes.shape({
        titleText: PropTypes.string,
        rowData: PropTypes.array,
      }),
    ),
  ),
};

KBMatches.defaultProps = {
  syncedTableData: {
    table: {
      titleText: '',
      rowData: [],
    },
  },
  unsyncedTableData: {},
  hiddenTableData: {
    table: {
      titleText: '',
      rowData: [],
    },
  },
};

export default KBMatches;
