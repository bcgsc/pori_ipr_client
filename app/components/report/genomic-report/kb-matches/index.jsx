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
import { columnDefs, targetedColumnDefs } from './columnDefs';

/**
 * @param {*} props props
 * @property {array} novelAlterations
 * @property {array} unknownAlterations
 * @property {array} approvedThisCancer
 * @property {array} approvedOtherCancer
 * @property {array} targetedGenes
 * @returns {*} JSX
 */
function KBMatches(props) {
  const {
    alterations,
    novelAlterations,
    unknownAlterations,
    approvedThisCancer,
    approvedOtherCancer,
    targetedGenes,
  } = props;

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

  const [rowData, setRowData] = useState({
    thisCancer: {},
    otherCancer: {},
    therapeutic: {},
    diagnostic: {},
    prognostic: {},
    biological: {},
  });

  const [showUnknown, setShowUnknown] = useState(false);
  const [showNovel, setShowNovel] = useState(false);

  const coalesceEntries = (entries) => {
    const bucketKey = (entry, delimiter = '||') => {
      const {
        ident, updatedAt, createdAt, ...row
      } = entry;
      const { gene, context, variant } = row;
      return `${gene}${delimiter}${context}${delimiter}${variant}`;
    };

    const buckets = {};

    entries.forEach((entry) => {
      const key = bucketKey(entry);
      if (!buckets[key]) {
        buckets[key] = {
          ...entry, disease: new Set([entry.disease]), reference: new Set([entry.reference]),
        };
      } else {
        buckets[key].disease.add(entry.disease);
        buckets[key].reference.add(entry.reference);
      }
    });
    return Object.values(buckets);
  };


  const [unknownRowData, setUnknownRowData] = useState({
    title: 'Uncharacterized Alterations',
    rowData: coalesceEntries(unknownAlterations),
  });

  const [novelRowData, setNovelRowData] = useState({
    title: 'Alterations For Review',
    rowData: coalesceEntries(novelAlterations),
  });


  const groupCategories = (entries) => {
    let grouped = {
      therapeutic: new Set(),
      diagnostic: new Set(),
      prognostic: new Set(),
      biological: new Set(),
    };
    
    entries.forEach((row) => {
      grouped[row.alterationType].add(row);
    });

    grouped = Object.entries(grouped).reduce((accumulator, [key, group]) => {
      accumulator[key] = [...group];
      return accumulator;
    }, {});
    return grouped;
  };

  useEffect(() => {
    const {
      therapeutic, diagnostic, prognostic, biological,
    } = groupCategories(alterations);

    const tempRowData = {
      thisCancer: {
        title: 'Therapies Approved In This Cancer Type',
        rowData: coalesceEntries(approvedThisCancer),
      },
      otherCancer: {
        title: 'Therapies Approved In Other Cancer Type',
        rowData: coalesceEntries(approvedOtherCancer),
      },
      therapeutic: {
        title: 'Therapeutic Alterations',
        rowData: coalesceEntries(therapeutic),
      },
      diagnostic: {
        title: 'Diagnostic Alterations',
        rowData: coalesceEntries(diagnostic),
      },
      prognostic: {
        title: 'Prognostic Alterations',
        rowData: coalesceEntries(prognostic),
      },
      biological: {
        title: 'Biological Alterations',
        rowData: coalesceEntries(biological),
      },
    };

    setRowData(tempRowData);
  }, []);

  useEffect(() => {
    localStorage.setItem('visibleColsKb', visibleCols);
    localStorage.setItem('hiddenColsKb', hiddenCols);
  }, [visibleCols, hiddenCols]);

  const handleSearch = event => setSearchText(event.target.value);

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
              columnDefs={columnDefs}
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
        <Button
          onClick={() => setShowNovel(prevVal => !prevVal)}
          color="primary"
          variant="outlined"
        >
          {showNovel ? 'Hide ' : 'Show '}
          Alterations For Review
        </Button>

        <Button
          onClick={() => setShowUnknown(prevVal => !prevVal)}
          color="primary"
          variant="outlined"
        >
          {showUnknown ? 'Hide ' : 'Show '}
          Uncharacterized Alterations
        </Button>
      </div>

      {showNovel
        && (
          <DataTable
            columnDefs={columnDefs}
            rowData={novelRowData.rowData || []}
            title={novelRowData.title}
            visibleCols={visibleCols}
            hiddenCols={hiddenCols}
            setVisibleCols={handleVisibleColsChange}
            setHiddenCols={handleHiddenColsChange}
            searchText={searchText}
          />
        )
      }

      {showUnknown
        && (
          <DataTable
            columnDefs={columnDefs}
            rowData={unknownRowData.rowData || []}
            title={unknownRowData.title}
            visibleCols={visibleCols}
            hiddenCols={hiddenCols}
            setVisibleCols={handleVisibleColsChange}
            setHiddenCols={handleHiddenColsChange}
            searchText={searchText}
          />
        )
      }
    </>
  );
}

KBMatches.propTypes = {
  alterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  novelAlterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  unknownAlterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  approvedThisCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  approvedOtherCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  targetedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default KBMatches;
