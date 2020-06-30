import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  InputAdornment,
} from '@material-ui/core';
import {
  FilterList,
} from '@material-ui/icons';

import DataTable from '../../../../components/DataTable';
import { columnDefs, targetedColumnDefs } from './columnDefs';
import coalesceEntries from './coalesce';
import AlterationService from '@/services/reports/alteration.service';
import TargetedGenesService from '@/services/reports/targeted-genes.service';

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
    report,
  } = props;

  const [visibleColumns, setVisibleColumns] = useState(
    localStorage.getItem(VISIBLE)
      ? localStorage.getItem(VISIBLE).split(',')
      : columnDefs.filter(c => !c.hide).map(c => c.colId),
  );

  const [targetedGenes, setTargetedGenes] = useState();

  const [filterText, setFilterText] = useState('');

  const [syncedTableData, setSyncedTableData] = useState();

  const [unsyncedTableData] = useState({
    titleText: 'Detected Alterations From Targeted Gene Report',
    rowData: targetedGenes,
  });

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const promises = Promise.all([
          AlterationService.getType(
            report.ident,
            { approvedTherapy: false, category: 'therapeutic' },
          ),
          AlterationService.getType(
            report.ident,
            { approvedTherapy: false, category: 'biological' },
          ),
          AlterationService.getType(
            report.ident,
            { approvedTherapy: false, category: 'diagnostic' },
          ),
          AlterationService.getType(
            report.ident,
            { approvedTherapy: false, category: 'prognostic' },
          ),
          AlterationService.getType(
            report.ident,
            { category: 'unknown,novel' },
          ),
          AlterationService.getType(
            report.ident,
            { matchedCancer: true, approvedTherapy: true, category: 'therapeutic' },
          ),
          AlterationService.getType(
            report.ident,
            { matchedCancer: false, approvedTherapy: true, category: 'therapeutic' },
          ),
          TargetedGenesService.getAll(report.ident),
        ]);

        const [
          therapeuticResp,
          biologicalResp,
          diagnosticResp,
          prognosticResp,
          unknownResp,
          thisCancerResp,
          otherCancerResp,
          targetedGenesResp,
        ] = await promises;

        setTargetedGenes(targetedGenesResp);

        setSyncedTableData({
          thisCancer: {
            titleText: 'Therapies Approved In This Cancer Type',
            rowData: coalesceEntries(thisCancerResp),
          },
          otherCancer: {
            titleText: 'Therapies Approved In Other Cancer Type',
            rowData: coalesceEntries(otherCancerResp),
          },
          therapeutic: {
            titleText: 'Therapeutic Alterations',
            rowData: coalesceEntries(therapeuticResp),
          },
          diagnostic: {
            titleText: 'Diagnostic Alterations',
            rowData: coalesceEntries(diagnosticResp),
          },
          prognostic: {
            titleText: 'Prognostic Alterations',
            rowData: coalesceEntries(prognosticResp),
          },
          biological: {
            titleText: 'Biological Alterations',
            rowData: coalesceEntries(biologicalResp),
          },
          unknown: {
            titleText: 'Other Alterations',
            rowData: coalesceEntries(unknownResp),
          },
        });
      };

      getData();
    }
  }, [report]);
  
  const handleFilter = event => setFilterText(event.target.value);

  const syncVisibleColumns = (visible) => {
    setVisibleColumns(visible);
    localStorage.setItem('visibleColsKb', visible);
  };

  useEffect(() => {
    if (Array.isArray(visibleColumns)) {
      if (!visibleColumns.includes('Actions')) {
        visibleColumns.push('Actions');
      }
    }
  }, [visibleColumns]);

  return (
    <>
      {report && syncedTableData && unsyncedTableData ? (
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
                canToggleColumns
                reportIdent={report.ident}
              />
            ))}
          </div>

          {report.type !== 'probe' && (
            <div>
              <DataTable
                columnDefs={targetedColumnDefs}
                rowData={unsyncedTableData.rowData || []}
                titleText={unsyncedTableData.titleText}
                filterText={filterText}
                reportIdent={report.ident}
              />
            </div>
          )}
        </>
      ) : null}
    </>
  );
}

KBMatches.propTypes = {
  report: PropTypes.object.isRequired,
};

export default KBMatches;
