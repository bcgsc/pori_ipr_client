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
import { columnDefs, targetedColumnDefs } from './ColumnDefs';

import './index.scss';

const VISIBLE = 'visibleColsKb';
const HIDDEN = 'hiddenColsKb';

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

  const [visibleCols, setVisibleCols] = useState(
    localStorage.getItem(VISIBLE)
      ? localStorage.getItem(VISIBLE).split(',')
      : columnDefs.filter(c => !c.hide).map(c => c.field),
  );
  const [hiddenCols, setHiddenCols] = useState(
    localStorage.getItem(HIDDEN)
      ? localStorage.getItem(HIDDEN).split(',')
      : columnDefs.filter(c => c.hide).map(c => c.field),
  );

  const [arrayColumns] = useState(['disease', 'reference']);

  const [filterText, setFilterText] = useState('');

  const handleVisibleColsChange = (change) => {
    setVisibleCols(change);
  };
  const handleHiddenColsChange = (change) => {
    setHiddenCols(change);
  };

  useEffect(() => {
    localStorage.setItem('visibleColsKb', visibleCols);
    localStorage.setItem('hiddenColsKb', hiddenCols);
  }, [visibleCols, hiddenCols]);

  const handleFilter = event => setFilterText(event.target.value);

  return (
    <>
      <div className="kb-matches__filter">
        <TextField
          label="Filter Table Text"
          type="text"
          variant="outlined"
          size="small"
          value={filterText}
          onChange={handleFilter}
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
            key={table.title}
            columnDefs={columnDefs}
            arrayColumns={arrayColumns}
            rowData={table.rowData || []}
            title={table.title}
            visibleCols={visibleCols}
            hiddenCols={hiddenCols}
            setVisibleCols={handleVisibleColsChange}
            setHiddenCols={handleHiddenColsChange}
            filterText={filterText}
          />
        ))}
      </div>

      <div>
        <DataTable
          columnDefs={targetedColumnDefs}
          rowData={unsyncedTableData.rowData || []}
          title={unsyncedTableData.title}
          filterText={filterText}
        />
      </div>

      {Object.values(thisHiddenTableData).map(table => (
        <div className="expansion-panel" key={table.title}>
          <ExpansionPanel
            TransitionProps={{ unmountOnExit: true }}
            elevation={0}
          >
            <ExpansionPanelSummary
              expandIcon={<ExpandMore />}
              classes={{ root: 'expansion-panel__summary' }}
            >
              <Typography variant="h6">
                {table.title}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              classes={{ root: 'expansion-panel__details' }}
            >
              <DataTable
                columnDefs={columnDefs}
                rowData={table.rowData || []}
                visibleCols={visibleCols}
                hiddenCols={hiddenCols}
                setVisibleCols={handleVisibleColsChange}
                setHiddenCols={handleHiddenColsChange}
                filterText={filterText}
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
      title: PropTypes.string,
      rowData: PropTypes.array,
    }),
  ),
  unsyncedTableData: PropTypes.shape({
    title: PropTypes.string,
    rowData: PropTypes.array,
  }),
  hiddenTableData: PropTypes.objectOf(
    PropTypes.objectOf(
      PropTypes.shape({
        title: PropTypes.string,
        rowData: PropTypes.array,
      }),
    ),
  ),
};

KBMatches.defaultProps = {
  syncedTableData: {
    table: {
      title: '',
      rowData: [],
    },
  },
  unsyncedTableData: {},
  hiddenTableData: {
    table: {
      title: '',
      rowData: [],
    },
  },
};

export default KBMatches;
