import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import DataTable from './data-table';

/**
 * @param {*} props props
 * @param {object} tableData table data for all tables
 * @param {object} hiddenTableData table data for all tables hidden by default
 * @param {func} setHiddenTableData function passed to set hidden tables
 * @param {array} syncedColumnDefs column definitions to by synced across tables
 * @returns {*} JSX
 */
function KBMatches(props) {
  const {
    tableData,
    hiddenTableData,
    setHiddenTableData,
    syncedColumnDefs,
  } = props;

  const [thisHiddenTableData, setThisHiddenTableData] = useState(hiddenTableData.current);

  const [visibleCols, setVisibleCols] = useState(
    (localStorage.getItem('visibleColsKb') || '').split(',')
    || syncedColumnDefs.filter(c => !c.hide).map(c => c.field),
  );
  const [hiddenCols, setHiddenCols] = useState(
    (localStorage.getItem('hiddenColsKb') || '').split(',')
    || syncedColumnDefs.filter(c => c.hide).map(c => c.field),
  );
  
  const handleVisibleColsChange = (change) => {
    setVisibleCols(change);
  };
  const handleHiddenColsChange = (change) => {
    setHiddenCols(change);
  };

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    localStorage.setItem('visibleColsKb', visibleCols);
    localStorage.setItem('hiddenColsKb', hiddenCols);
  }, [visibleCols, hiddenCols]);

  const handleSearch = event => setSearchText(event.target.value);

  const handleShowTables = (key, table) => {
    table.show = !table.show;
    const thisHiddenTableDataCopy = Object.assign({}, thisHiddenTableData);
    thisHiddenTableDataCopy[key] = table;
    setThisHiddenTableData(thisHiddenTableDataCopy);
  };

  return (
    <>
      <div className="kb-matches__search">
        <TextField
          label="Filter Table Text"
          type="text"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={handleSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <FilterListIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div>
        {Object.values(tableData).map(table => (
          <div key={table.title}>
            <DataTable
              columnDefs={table.columnDefs}
              rowData={table.rowData || []}
              title={table.title}
              visibleCols={visibleCols}
              hiddenCols={hiddenCols}
              setVisibleCols={handleVisibleColsChange}
              setHiddenCols={handleHiddenColsChange}
              searchText={searchText}
            />
          </div>
        ))}
      </div>

      <div className="kb-matches__button-container">
        {Object.entries(thisHiddenTableData).map(([key, table]) => (
          <Button
            onClick={() => handleShowTables(key, table)}
            color="primary"
            variant="outlined"
            key={table.title}
          >
            {table.show ? 'Hide ' : 'Show '}
            {table.title}
          </Button>
        ))}
      </div>

      {Object.values(thisHiddenTableData).map(table => (
        <div key={table.title}>
          {table.show
            && (
              <DataTable
                columnDefs={table.columnDefs}
                rowData={table.rowData || []}
                title={table.title}
                visibleCols={visibleCols}
                hiddenCols={hiddenCols}
                setVisibleCols={handleVisibleColsChange}
                setHiddenCols={handleHiddenColsChange}
                searchText={searchText}
              />
            )
          }
        </div>
      ))}
    </>
  );
}

KBMatches.propTypes = {
  tableData: PropTypes.shape({
    title: PropTypes.string,
    tableData: PropTypes.array,
    columnDefs: PropTypes.object,
  }).isRequired,
  hiddenTableData: PropTypes.shape({
    title: PropTypes.string,
    tableData: PropTypes.array,
    columnDefs: PropTypes.object,
    show: PropTypes.bool,
  }).isRequired,
  setHiddenTableData: PropTypes.func,
  syncedColumnDefs: PropTypes.arrayOf(PropTypes.object),
};

export default KBMatches;
