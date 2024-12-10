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
            api.get(`${baseUri}?approvedTherapy=false&category=therapeutic`, {}),
            api.get(`${baseUri}?approvedTherapy=false&category=biological`, {}),
            api.get(`${baseUri}?approvedTherapy=false&category=diagnostic`, {}),
            api.get(`${baseUri}?approvedTherapy=false&category=prognostic`, {}),
            api.get(`${baseUri}?category=unknown,novel`, {}),
            api.get(`${baseUri}?approvedTherapy=true&category=therapeutic&matchedCancer=true&iprEvidenceLevel=IPR-A,IPR-B`, {}),
            api.get(`/reports/${report.ident}/probe-results`, {}),
            api.get(`${baseUri}?category=pharmacogenomic`, {}),
            api.get(`${baseUri}?category=cancer predisposition`, {}),
          ]);

          const [
            therapeuticResp,
            biologicalResp,
            diagnosticResp,
            prognosticResp,
            unknownResp,
            highEvidenceResp,
            targetedSomaticGenesResp,
            pharmacogenomicResp,
            cancerPredisResp,
          ] = await apiCalls.request() as [
            KbMatchedStatementType[],
            KbMatchedStatementType[],
            KbMatchedStatementType[],
            KbMatchedStatementType[],
            KbMatchedStatementType[],
            KbMatchedStatementType[],
            ProbeResultsType[],
            KbMatchedStatementType[],
            KbMatchedStatementType[],
          ];

          setGroupedMatches({
            highEvidence: coalesceEntries(highEvidenceResp),
            therapeutic: coalesceEntries(therapeuticResp),
            biological: coalesceEntries(biologicalResp),
            diagnostic: coalesceEntries(diagnosticResp),
            prognostic: coalesceEntries(prognosticResp),
            unknown: coalesceEntries(unknownResp),
            targetedGermlineGenes: coalesceEntries([
              ...pharmacogenomicResp,
              ...cancerPredisResp.filter(({ kbMatches }) => (kbMatches as any)?.variant?.germline),
            ]),
            targetedSomaticGenes: targetedSomaticGenesResp.filter((tg) => !/germline/.test(tg?.sample)),
          });
        } catch (err) {
          if (err.name === 'CoalesceEntriesError') {
            snackbar.error(err.message);
            console.error(err);
          } else {
            snackbar.error(`Network error: ${err}`);
            console.error(err);
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
