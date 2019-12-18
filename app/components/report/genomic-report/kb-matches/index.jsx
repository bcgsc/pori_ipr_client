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
    || columnDefs.filter(c => !c.hide).map(c => c.colId),
  );
  const [hiddenCols, setHiddenCols] = useState(
    localStorage.getItem('hiddenColsKb').split(',')
    || columnDefs.filter(c => c.hide).map(c => c.colId),
  );
  
  const handleVisibleColsChange = (change) => {
    setVisibleCols(change);
  };
  const handleHiddenColsChange = (change) => {
    setHiddenCols(change);
  };

  const [searchText, setSearchText] = useState('');

  const [groupedAlterations, setGroupedAlterations] = useState({
    therapeutic: [],
    diagnostic: [],
    prognostic: [],
    biological: [],
  });
  const [groupedApprovedThisCancer, setGroupedApprovedThisCancer] = useState([]);
  const [groupedApprovedOtherCancer, setGroupedApprovedOtherCancer] = useState([]);
  const [groupedUnknownAlterations, setGroupedUnknownAlterations] = useState([]);
  const [groupedNovelAlterations, setGroupedNovelAlterations] = useState([]);

  const [showUnknown, setShowUnknown] = useState(false);
  const [showNovel, setShowNovel] = useState(false);

 // const coalesceEntries = entries => [...new Set(
 //   entries.map(({
 //     ident, updatedAt, createdAt, zygosity, ...keepAttrs
 //   }) => keepAttrs),
 // )];
 // const coalesceEntries = (entries) => {
 //   const returnedEntries = [];
 //   entries.forEach((entry) => {
 //     if (returnedEntries.length > 0) {
 //       returnedEntries.forEach((innerVal) => {
 //         if (JSON.stringify(innerVal) !== JSON.stringify(entry)) {
 //           returnedEntries.push(entry);
 //         }
 //       });
 //     } else {
 //       returnedEntries.push(entry);
 //     }
 //   });
 //   return returnedEntries;
 // }
  const coalesceEntries = (entries) => {
    const bucketKey = (entry, delimiter = '||') => {
      const {
        ident, updatedAt, createdAt, ...row
      } = entry;
      const { relevance, context, variant } = row;
      return `${relevance}${delimiter}${context}${delimiter}${variant}`;
    };

    const buckets = {};

    entries.forEach((entry) => {
      const key = bucketKey(entry);
      if (!buckets[key]) {
        buckets[key] = { ...entry, disease: new Set(entry.disease), pmid: new Set(entry.pmid) };
      } else {
        buckets[key].disease.add(entry.disease);
        buckets[key].pmid.add(entry.pmid);
      }
    });
    console.log(Object.values(buckets));
    return Object.values(buckets);
  };


  const groupCategories = (entries) => {
    let grouped = {};
    
    entries.forEach((row) => {
      if (!(Object.prototype.hasOwnProperty.call(grouped, row.alterationType))) {
        grouped[row.alterationType] = new Set([row]);
      } else {
        grouped[row.alterationType].add(row);
      }
    });

    grouped = Object.entries(grouped).reduce((accumulator, [key, group]) => {
      accumulator[key] = [...group];
      return accumulator;
    }, {});
    return grouped;
  };

  useEffect(() => {
    setGroupedAlterations(groupCategories(alterations));
    setGroupedApprovedThisCancer(coalesceEntries(approvedThisCancer));
    setGroupedApprovedOtherCancer(coalesceEntries(approvedOtherCancer));
    setGroupedUnknownAlterations(coalesceEntries(unknownAlterations));
    setGroupedNovelAlterations(coalesceEntries(novelAlterations));
  }, []);

  useEffect(() => {
    localStorage.setItem('visibleColsKb', visibleCols);
    localStorage.setItem('hiddenColsKb', hiddenCols);
  }, [visibleCols, hiddenCols]);

  const handleSearch = event => setSearchText(event.target.value);

  return (
    <div>
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

      <DataTable
        columnDefs={columnDefs}
        rowData={groupedApprovedThisCancer || []}
        title="Therapies Approved In This Cancer Type"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />

      <DataTable
        columnDefs={columnDefs}
        rowData={groupedApprovedOtherCancer || []}
        title="Therapies Approved In Other Cancer Type"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />

      <DataTable
        columnDefs={columnDefs}
        rowData={groupedAlterations.therapeutic || []}
        title="Therapeutic Alterations"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />

      <DataTable
        columnDefs={columnDefs}
        rowData={groupedAlterations.diagnostic || []}
        title="Diagnostic Alterations"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />

      <DataTable
        columnDefs={columnDefs}
        rowData={groupedAlterations.prognostic || []}
        title="Prognostic Alterations"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />
      
      <DataTable
        columnDefs={columnDefs}
        rowData={groupedAlterations.biological || []}
        title="Biological alterations"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />

      <DataTable
        columnDefs={targetedColumnDefs}
        rowData={targetedGenes || []}
        title="Detected Alterations In The Targeted Gene Report"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />

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
            rowData={groupedNovelAlterations || []}
            title="Alterations For Review"
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
            rowData={groupedUnknownAlterations || []}
            title="Uncharacterized Alterations"
            visibleCols={visibleCols}
            hiddenCols={hiddenCols}
            setVisibleCols={handleVisibleColsChange}
            setHiddenCols={handleHiddenColsChange}
            searchText={searchText}
          />
        )
      }
    </div>
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
