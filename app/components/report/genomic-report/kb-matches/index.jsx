import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DataTable from './data-table';
import { columnDefs, targetedColumnDefs } from './columnDefs';

/**
 * 
 * @param {*} props 
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

  const coalesceEntries = entries => [...new Set(entries)];
  
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
  }, []);

  return (
    <div>
      <DataTable
        columnDefs={columnDefs}
        rowData={groupedApprovedThisCancer}
        title="Therapies Approved In This Cancer Type"
      />
      <DataTable
        columnDefs={columnDefs}
        rowData={groupedApprovedOtherCancer}
        title="Therapies Approved In Other Cancer Type"
      />
      <DataTable
        columnDefs={columnDefs}
        rowData={groupedAlterations.therapeutic}
        title="Therapeutic Alterations"
      />
      <DataTable
        columnDefs={columnDefs}
        rowData={groupedAlterations.diagnostic}
        title="Diagnostic Alterations"
      />
      <DataTable
        columnDefs={columnDefs}
        rowData={groupedAlterations.prognostic}
        title="Prognostic Alterations"
      />
      <DataTable
        columnDefs={columnDefs}
        rowData={groupedAlterations.biological}
        title="Biological alterations"
      />
      <DataTable
        columnDefs={targetedColumnDefs}
        rowData={targetedGenes}
        title="Detected Alterations In The Targeted Gene Report"
      />
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
