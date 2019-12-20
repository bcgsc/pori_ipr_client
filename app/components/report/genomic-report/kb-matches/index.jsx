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

  const [groupedTherapeutic, setGroupedTherapeutic] = useState([]);
  const [groupedDiagnostic, setGroupedDiagnostic] = useState([]);
  const [groupedPrognostic, setGroupedPrognostic] = useState([]);
  const [groupedBiological, setGroupedBiological] = useState([]);
  const [groupedApprovedThisCancer, setGroupedApprovedThisCancer] = useState([]);
  const [groupedApprovedOtherCancer, setGroupedApprovedOtherCancer] = useState([]);
  const [groupedUnknownAlterations, setGroupedUnknownAlterations] = useState([]);
  const [groupedNovelAlterations, setGroupedNovelAlterations] = useState([]);

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
    const categories = groupCategories(alterations);
    setGroupedTherapeutic(coalesceEntries(categories.therapeutic));
    setGroupedDiagnostic(coalesceEntries(categories.diagnostic));
    setGroupedPrognostic(coalesceEntries(categories.prognostic));
    setGroupedBiological(coalesceEntries(categories.biological));

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
        rowData={groupedTherapeutic || []}
        title="Therapeutic Alterations"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />

      <DataTable
        columnDefs={columnDefs}
        rowData={groupedDiagnostic || []}
        title="Diagnostic Alterations"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />

      <DataTable
        columnDefs={columnDefs}
        rowData={groupedPrognostic || []}
        title="Prognostic Alterations"
        visibleCols={visibleCols}
        hiddenCols={hiddenCols}
        setVisibleCols={handleVisibleColsChange}
        setHiddenCols={handleHiddenColsChange}
        searchText={searchText}
      />
      
      <DataTable
        columnDefs={columnDefs}
        rowData={groupedBiological || []}
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
