import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  FilterList,
} from '@mui/icons-material';

import { useDebounce } from 'use-debounce';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import useReport from '@/hooks/useReport';
import DataTable from '@/components/DataTable';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import ReportContext from '@/context/ReportContext';
import { KbMatchedStatementType } from '@/common';
import { columnDefs, targetedColumnDefs } from './columnDefs';
import coalesceEntries from './coalesce';

import './index.scss';
import ProbeResultsType from '../ProbeSummary/types';

const TITLE_MAP = {
  highEvidence: 'Therapeutic Alterations with High-Level Clinical Evidence in this Tumour Type',
  therapeutic: 'Therapeutic Alterations',
  diagnostic: 'Diagnostic Alterations',
  prognostic: 'Prognostic Alterations',
  biological: 'Biological Alterations',
  unknown: 'Other Alterations',
  targetedGermlineGenes: 'Detected Alterations from Pharmacogenomic and Cancer Predisposition Targeted Gene Report',
  targetedSomaticGenes: 'Detected Alterations From Somatic Targeted Gene Report',
};

const FILTER_DEBOUNCE_TIME = 500; // ms before input text for filter refreshes for tables

type KbMatchesProps = {
  /* Should the print version be displayed? */
  isPrint?: boolean;
} & WithLoadingInjectedProps;

const KbMatches = ({
  isPrint = false,
  setIsLoading,
  isLoading,
}: KbMatchesProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useReport();

  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText] = useDebounce(filterText, FILTER_DEBOUNCE_TIME);
  const [groupedMatches, setGroupedMatches] = useState({
    therapeutic: [],
    biological: [],
    diagnostic: [],
    prognostic: [],
    unknown: [],
    highEvidence: [],
    targetedGermlineGenes: [],
    targetedSomaticGenes: [],
  });

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const baseUri = `/reports/${report.ident}/kb-matches/kb-matched-statements`;
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/probe-results`, {}),
            api.get(`${baseUri}`, {}),
          ]);

          const [
            targetedSomaticGenesResp,
            allKbMatchesResp,
          ] = await apiCalls.request() as [
            ProbeResultsType[],
            KbMatchedStatementType[],
          ];

          // TODO this is here for backwards compatibility; consider removing after datafix
          const oldStmts = allKbMatchesResp.filter((stmt) => !stmt.kbData?.kbmatchTag);
          const oldHighEvidence = oldStmts.filter((item) => item.category === 'therapeutic'
            && item.approvedTherapy
            && item.matchedCancer === true
            && ['IPR-A', 'IPR-B'].includes(item?.iprEvidenceLevel));

          // therapeutic but not best therapeutic. might be inconsistent with existing filtering -
          // currently items that are therapeutic and approved but not with high evidence level are just
          // not displayed (there may currently not be any such items). the difference will be
          // that some items that were not previously displayed at all might now be displayed
          // in this table
          const oldTherapeutic = oldStmts.filter((item) => item.category === 'therapeutic'
            && !oldHighEvidence.some((obj) => obj.ident === item.ident));

          // might be inconsistent with existing filtering - currently items that have
          // 'approvedTherapy' True but not category 'therapeutic' are not displayed.
          // (there are no examples in the db currently). here, we ignore approvedTherapy
          // except for therapeutic stmts, so it's possible for items that previously
          // would never be displayed, to be displayed here
          const oldBiological = oldStmts.filter((item) => item.category === 'biological');
          const oldDiagnostic = oldStmts.filter((item) => item.category === 'diagnostic');
          const oldPrognostic = oldStmts.filter((item) => item.category === 'prognostic');
          const oldPcp = oldStmts.filter((item) => ['cancer-predisposition', 'pharmacogenomic'].includes(item.category));

          const taggedKbMatches = allKbMatchesResp.filter((stmt) => stmt?.kbData?.kbmatchTag);

          const highEvidenceStmts = [...oldHighEvidence, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'bestTherapeutic')];
          const therapeuticStmts = [...oldTherapeutic, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'therapeutic')];
          const biologicalStmts = [...oldBiological, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'biological')];
          const diagnosticStmts = [...oldDiagnostic, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'diagnostic')];
          const prognosticStmts = [...oldPrognostic, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'prognostic')];
          const targetedGermlineGenesStmts = [...oldPcp, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'pcp')];
          const highEvidence = coalesceEntries(highEvidenceStmts);
          const therapeutic = coalesceEntries(therapeuticStmts);
          const biological = coalesceEntries(biologicalStmts);
          const diagnostic = coalesceEntries(diagnosticStmts);
          const prognostic = coalesceEntries(prognosticStmts);
          const targetedGermlineGenes = coalesceEntries(targetedGermlineGenesStmts);
          const unknown = coalesceEntries(allKbMatchesResp.filter((stmt) => ![...highEvidenceStmts, ...therapeuticStmts, ...biologicalStmts, ...diagnosticStmts, ...prognosticStmts, ...targetedGermlineGenesStmts].some((obj) => obj.ident === stmt.ident)));

          setGroupedMatches({
            highEvidence,
            therapeutic,
            biological,
            diagnostic,
            prognostic,
            targetedGermlineGenes,
            unknown,
            targetedSomaticGenes: targetedSomaticGenesResp.filter((tg) => !/germline/.test(tg?.sample)),
          });
        } catch (err) {
          if (err.name === 'CoalesceEntriesError') {
            snackbar.error(err.message);
          } else {
            snackbar.error(`Network error: ${err}`);
          }
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [report, setIsLoading]);

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => (
    setFilterText(event.target.value)
  );

  const handleDelete = useCallback(async (row) => {
    try {
      // More than one ident coalesced into one row
      if (Array.isArray(row.ident)) {
        const apiCalls = new ApiCallSet();
        row.ident.forEach((ident: string) => {
          apiCalls.push(api.del(`/reports/${report.ident}/kb-matches/kb-matched-statements/${ident}`, {}, {}));
        });
        await apiCalls.request();
      } else {
        await api.del(`/reports/${report.ident}/kb-matches/kb-matched-statements/${row.ident}`, {}, {}).request();
      }

      setGroupedMatches((oldMatches) => {
        const newMatches = { ...oldMatches };

        // Therapeutic matches can also be in this/otherCancer
        if (row.category === 'therapeutic') {
          ['therapeutic', 'highEvidence'].forEach((category) => {
            let dataSet = newMatches[category];
            dataSet = dataSet.filter((val) => val.ident !== row.ident);
            newMatches[category] = dataSet ?? [];
          });
        } else {
          let dataSet = newMatches[row.category];
          dataSet = dataSet.filter((val) => val.ident !== row.ident);
          newMatches[row.category] = dataSet ?? [];
        }
        return newMatches;
      });
      snackbar.success('Row deleted');
    } catch (err) {
      snackbar.error(`Deletion failed: ${err}`);
    }
  }, [report]);

  const kbMatchedTables = useMemo(() => Object.keys(TITLE_MAP).map((key) => (
    <React.Fragment key={key}>
      {
        (
          (report?.template.name !== 'probe' && report?.template.name !== 'rapid')
          || (key !== 'targetedSomaticGenes' && key !== 'targetedGermlineGenes')
        ) && (
          <DataTable
            canDelete={canEdit}
            canToggleColumns
            columnDefs={(key === 'targetedSomaticGenes') ? targetedColumnDefs : columnDefs}
            filterText={debouncedFilterText}
            isPrint={isPrint}
            onDelete={handleDelete}
            rowData={groupedMatches[key]}
            titleText={TITLE_MAP[key]}
          />
        )
      }
    </React.Fragment>
  )), [canEdit, debouncedFilterText, groupedMatches, handleDelete, isPrint, report?.template.name]);

  return (
    !isLoading && (
      <div>
        <DemoDescription>
          Tumour alterations with specific therapeutic, prognostic, diagnostic or biological
          associations are identified using the knowledgebase GraphKB, which integrates information
          from sources including cancer databases, drug databases, clinical tests, and the literature.
          Associations are listed by the level of evidence for the use of that drug in the context of
          the observed alteration, including those that are approved in this or other cancer types,
          and those that have early clinical or preclinical evidence.
        </DemoDescription>
        {!isPrint && (
          <div className="kb-matches__filter">
            <TextField
              label="Filter Table Text"
              type="text"
              variant="outlined"
              value={filterText}
              onChange={handleFilter}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <FilterList color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        )}
        <div>
          {kbMatchedTables}
        </div>
      </div>
    )
  );
};

export default withLoading(KbMatches);
