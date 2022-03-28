import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  FilterList,
} from '@mui/icons-material';

import partition from 'lodash.partition';

import api, { ApiCallSet } from '@/services/api';
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
  targetedGermlineGenes: 'Detected Alterations from Pharmacogenomic and Cancer Predisposition Targeted Gene Report',
  targetedSomaticGenes: 'Detected Alterations From Somatic Targeted Gene Report',
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
    targetedGermlineGenes: [],
    targetedSomaticGenes: [],
  });

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const baseUri = `/reports/${report.ident}/kb-matches`;
          const apiCalls = new ApiCallSet([
            api.get(`${baseUri}?approvedTherapy=false&category=therapeutic`, {}),
            api.get(`${baseUri}?approvedTherapy=false&category=biological`, {}),
            api.get(`${baseUri}?approvedTherapy=false&category=diagnostic`, {}),
            api.get(`${baseUri}?approvedTherapy=false&category=prognostic`, {}),
            api.get(`${baseUri}?category=unknown,novel`, {}),
            api.get(`${baseUri}?approvedTherapy=true&category=therapeutic&matchedCancer=true`, {}),
            api.get(`${baseUri}?approvedTherapy=true&category=therapeutic&matchedCancer=false`, {}),
            api.get(`/reports/${report.ident}/probe-results`, {}),
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
          ] = await apiCalls.request();

          const [targetedGermlineGenes, targetedSomaticGenes] = partition(targetedGenesResp, (tg) => /germline/.test(tg?.sample));

          setGroupedMatches({
            thisCancer: coalesceEntries(thisCancerResp),
            otherCancer: coalesceEntries(otherCancerResp),
            therapeutic: coalesceEntries(therapeuticResp),
            biological: coalesceEntries(biologicalResp),
            diagnostic: coalesceEntries(diagnosticResp),
            prognostic: coalesceEntries(prognosticResp),
            unknown: coalesceEntries(unknownResp),
            targetedGermlineGenes,
            targetedSomaticGenes,
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
        const apiCalls = new ApiCallSet();
        row.ident.forEach((ident: string) => {
          apiCalls.push(api.del(`/reports/${report.ident}/kb-matches/${ident}`, {}, {}));
        });
        await apiCalls.request();
      } else {
        await api.del(`/reports/${report.ident}/kb-matches/${row.ident}`, {}, {}).request();
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

  const kbMatchedTables = Object.entries(groupedMatches).map(([key, value]) => (
    <React.Fragment key={key}>
      {(report?.template.name !== 'probe'
        || (key !== 'targetedSomaticGenes' && key !== 'targetedGermlineGenes')
      ) && (
      <DataTable
        canDelete={canEdit}
        canToggleColumns
        columnDefs={(key === 'targetedSomaticGenes' || key === 'targetedGermlineGenes')
          ? targetedColumnDefs
          : columnDefs}
        filterText={filterText}
        isPrint={isPrint}
        onDelete={handleDelete}
        rowData={value}
        titleText={titleMap[key]}
      />
      )}
    </React.Fragment>
  ));

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
