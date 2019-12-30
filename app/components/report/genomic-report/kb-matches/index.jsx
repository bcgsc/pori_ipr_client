import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import DataTable from './data-table';

/**
 * @param {*} props props
 * @param {array} novelAlterations novel alterations array
 * @param {array} unknownAlterations unknown alterations array
 * @param {array} approvedThisCancer this cancer array
 * @param {array} approvedOtherCancer other cancer array
 * @param {array} targetedGenes targeted genes array
 * @returns {*} JSX
 */
function KBMatches(props) {
  const {
    rowData,
    hiddenRowData,
    setHiddenRowData,
  } = props;

  const [thisHiddenRowData, setThisHiddenRowData] = useState(hiddenRowData.current);

  const [visibleCols, setVisibleCols] = useState(
    localStorage.getItem('visibleColsKb').split(',')
    || columnDefs.filter(c => !c.hide).map(c => c.field),
  );
  const [hiddenCols, setHiddenCols] = useState(
    localStorage.getItem('hiddenColsKb').split(',')
    || columnDefs.filter(c => c.hide).map(c => c.field),
  );
  
  const handleVisibleColsChange = (change) => {
    setVisibleCols(change);
  };
  const handleHiddenColsChange = (change) => {
    setHiddenCols(change);
  };

  const [searchText, setSearchText] = useState('');

  const [showUnknown, setShowUnknown] = useState(false);
  const [showNovel, setShowNovel] = useState(false);

  useEffect(() => {
    localStorage.setItem('visibleColsKb', visibleCols);
    localStorage.setItem('hiddenColsKb', hiddenCols);
  }, [visibleCols, hiddenCols]);

  const handleSearch = event => setSearchText(event.target.value);

  const handleShowTables = (key, row) => {
    row.show = !row.show;
    const thisHiddenRowDataCopy = Object.assign({}, thisHiddenRowData);
    thisHiddenRowDataCopy[key] = row;
    setThisHiddenRowData(thisHiddenRowDataCopy);
  };

  return (
    <>
      <div className="kb-matches__search">
        <TextField
          label="Quick Search"
          type="text"
          variant="outlined"
          size="small"
          fullWidth
          value={searchText}
          onChange={handleSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div>
        {Object.values(rowData).map(row => (
          <div key={row.title}>
            <DataTable
              columnDefs={row.columnDefs}
              rowData={row.rowData || []}
              title={row.title}
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
        {Object.entries(thisHiddenRowData).map(([key, row]) => (
          <Button
            onClick={() => handleShowTables(key, row)}
            color="primary"
            variant="outlined"
            key={row.title}
          >
            {row.show ? 'Hide ' : 'Show '}
            {row.title}
          </Button>
        ))}
      </div>

      {Object.values(thisHiddenRowData).map(row => (
        <div key={row.title}>
          {row.show
            && (
              <DataTable
                columnDefs={row.columnDefs}
                rowData={row.rowData || []}
                title={row.title}
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
  rowData: PropTypes.shape({
    title: PropTypes.string,
    rowData: PropTypes.array,
    columnDefs: PropTypes.object,
  }).isRequired,
  hiddenRowData: PropTypes.shape({
    title: PropTypes.string,
    rowData: PropTypes.array,
    columnDefs: PropTypes.object,
    show: PropTypes.bool,
  }).isRequired,
  setHiddenRowData: PropTypes.func,
};

export default KBMatches;
