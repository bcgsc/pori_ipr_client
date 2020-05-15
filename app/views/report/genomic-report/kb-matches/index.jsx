import React, { useState, useEffect } from 'react';
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
 * @param {string} reportIdent report ident string
 * @returns {*} JSX
 */
function KBMatches(props) {
  const {
    syncedTableData,
    unsyncedTableData,
    hiddenTableData,
    reportIdent,
    isProbe,
  } = props;

  const [thisHiddenTableData, setThisHiddenTableData] = useState(hiddenTableData.current);

  const [visibleColumns, setVisibleColumns] = useState(
    localStorage.getItem(VISIBLE)
      ? localStorage.getItem(VISIBLE).split(',')
      : columnDefs.filter(c => !c.hide).map(c => c.colId),
  );

  useEffect(() => {
    if (Array.isArray(visibleColumns)) {
      if (!visibleColumns.includes('Actions')) {
        visibleColumns.push('Actions');
      }
    }
  }, [visibleColumns]);

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
            reportIdent={reportIdent}
          />
        ))}
      </div>

      {isProbe ? null : (
        <div>
          <DataTable
            columnDefs={targetedColumnDefs}
            rowData={unsyncedTableData.rowData || []}
            titleText={unsyncedTableData.titleText}
            filterText={filterText}
            edit={false}
            reportIdent={reportIdent}
          />
        </div>
      )}
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
  reportIdent: PropTypes.string.isRequired,
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
