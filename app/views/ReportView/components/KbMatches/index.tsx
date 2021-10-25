import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  TextField,
  InputAdornment,
} from '@material-ui/core';
import {
  FilterList,
} from '@material-ui/icons';

import api, { ApiCallSet } from '@/services/api';
import { KbMatchType } from '@/common';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import useEdit from '@/hooks/useEdit';
import DataTable from '@/components/DataTable';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import ReportContext from '@/context/ReportContext';
import { columnDefs, targetedColumnDefs } from './columnDefs';
import coalesceEntries from './coalesce';

import './index.scss';

const titleMap = {
  thisCancer: 'Therapies Approved In This Cancer Type',
  otherCancer: 'Therapies Approved In Other Cancer Type',
  therapeutic: 'Therapeutic Alterations',
  diagnostic: 'Diagnostic Alterations',
  prognostic: 'Prognostic Alterations',
  biological: 'Biological Alterations',
  unknown: 'Other Alterations',
  targetedGenes: 'Detected Alterations From Targeted Gene Report',
};

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
  const { canEdit } = useEdit();

  const [filterText, setFilterText] = useState('');
  const [groupedMatches, setGroupedMatches] = useState({
    therapeutic: [],
    biological: [],
    diagnostic: [],
    prognostic: [],
    unknown: [],
    thisCancer: [],
    otherCancer: [],
    targetedGenes: [],
  });

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const baseUri = `/reports/${report.ident}/kb-matches`;
          const [
            therapeuticResp,
            biologicalResp,
            diagnosticResp,
            prognosticResp,
            unknownResp,
            thisCancerResp,
            otherCancerResp,
            targetedGenesResp,
          ] = await Promise.all([
            api.get<KbMatchType[]>(`${baseUri}?approvedTherapy=false&category=therapeutic`).request(),
            api.get<KbMatchType[]>(`${baseUri}?approvedTherapy=false&category=biological`).request(),
            api.get<KbMatchType[]>(`${baseUri}?approvedTherapy=false&category=diagnostic`).request(),
            api.get<KbMatchType[]>(`${baseUri}?approvedTherapy=false&category=prognostic`).request(),
            api.get<KbMatchType[]>(`${baseUri}?category=unknown,novel`).request(),
            api.get<KbMatchType[]>(`${baseUri}?approvedTherapy=true&category=therapeutic&matchedCancer=true`).request(),
            api.get<KbMatchType[]>(`${baseUri}?approvedTherapy=true&category=therapeutic&matchedCancer=false`).request(),
            api.get<KbMatchType[]>(`/reports/${report.ident}/probe-results`).request(),
          ]);

          setGroupedMatches({
            thisCancer: coalesceEntries(thisCancerResp),
            otherCancer: coalesceEntries(otherCancerResp),
            therapeutic: coalesceEntries(therapeuticResp),
            biological: coalesceEntries(biologicalResp),
            diagnostic: coalesceEntries(diagnosticResp),
            prognostic: coalesceEntries(prognosticResp),
            unknown: coalesceEntries(unknownResp),
            targetedGenes: targetedGenesResp,
          });
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
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
        const apiCalls = [];
        row.ident.forEach((ident: string) => {
          apiCalls.push(api.del(`/reports/${report.ident}/kb-matches/${ident}`, {}).request());
        });
        await Promise.all(apiCalls);
      } else {
        await api.del(`/reports/${report.ident}/kb-matches/${row.ident}`, {}).request();
      }

      setGroupedMatches((oldMatches) => {
        const newMatches = { ...oldMatches };

        // Therapeutic matches can also be in this/otherCancer
        if (row.category === 'therapeutic') {
          ['therapeutic', 'thisCancer', 'otherCancer'].forEach((category) => {
            let dataSet = newMatches[category];
            dataSet = dataSet.filter((val) => val.ident !== row.ident);
            newMatches[category] = dataSet;
          });
        } else {
          let dataSet = newMatches[row.category];
          dataSet = dataSet.filter((val) => val.ident !== row.ident);
          newMatches[row.category] = dataSet;
        }
        return newMatches;
      });
      snackbar.success('Row deleted');
    } catch (err) {
      snackbar.error(`Deletion failed: ${err}`);
    }
  }, [report]);

  return (
    <>
      {!isLoading && (
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
          )}
          <div>
            {Object.entries(groupedMatches).map(([key, value]) => (
              <React.Fragment key={key}>
                {(report.template.name !== 'probe' || key !== 'targetedGenes') && (
                  <DataTable
                    canDelete={canEdit}
                    canToggleColumns
                    columnDefs={key === 'targetedGenes' ? targetedColumnDefs : columnDefs}
                    filterText={filterText}
                    isPrint={isPrint}
                    onDelete={handleDelete}
                    rowData={value}
                    titleText={titleMap[key]}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default withLoading(KbMatches);
