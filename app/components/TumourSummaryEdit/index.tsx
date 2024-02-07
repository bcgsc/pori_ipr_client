import React, {
  useState, useEffect, useCallback, useContext, useMemo,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Button,
  Chip,
  Autocomplete,
} from '@mui/material';
import cloneDeep from 'lodash/cloneDeep';
import api, { ApiCallSet } from '@/services/api';
import ConfirmContext from '@/context/ConfirmContext';
import AsyncButton from '@/components/AsyncButton';
import useConfirmDialog from '@/hooks/useConfirmDialog';

import './index.scss';
import { ReportType } from '@/context/ReportContext';
import { MicrobialType, MutationBurdenType, TmburType } from '@/common';
import snackbar from '@/services/SnackbarUtils';

type TumourSummaryEditProps = {
  microbial: MicrobialType[];
  report: ReportType;
  mutationBurden: MutationBurdenType;
  tmburMutBur?: TmburType;
  isOpen: boolean;
  onClose: (
    isSaved: boolean,
    newMicrobialData?: MicrobialType[],
    newReportData?: ReportType,
    newMutationBurdenData?: MutationBurdenType,
    newTmBurMutBurData?: TmburType,
  ) => void;
};

const TumourSummaryEdit = ({
  microbial,
  report,
  report: {
    template: { name: reportType },
  },
  mutationBurden,
  tmburMutBur,
  isOpen,
  onClose,
}: TumourSummaryEditProps): JSX.Element => {
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();

  const [newMicrobialData, setNewMicrobialData] = useState(cloneDeep(microbial));
  const [newReportData, setNewReportData] = useState<Partial<ReportType>>(null);
  const [newMutationBurdenData, setNewMutationBurdenData] = useState<Partial<MutationBurdenType>>(null);
  const [newTmburMutData, setNewTmburMutData] = useState<Partial<TmburType>>(null);
  const [microbialDirty, setMicrobialDirty] = useState(false);
  const [reportDirty, setReportDirty] = useState(false);
  const [mutationBurdenDirty, setMutationBurdenDirty] = useState(false);
  const [tmburMutDirty, setTmburMutDirty] = useState(false);
  const [isApiCalling, setIsApiCalling] = useState(false);

  useEffect(() => {
    if (report) {
      setNewReportData({
        tumourContent: report.tumourContent,
        subtyping: report.subtyping,
        captiv8Score: report.captiv8Score,
      });
    }
  }, [report]);

  useEffect(() => {
    if (mutationBurden) {
      setNewMutationBurdenData({
        role: mutationBurden.role,
        totalMutationsPerMb: mutationBurden.totalMutationsPerMb,
        qualitySvCount: mutationBurden.qualitySvCount,
        qualitySvPercentile: mutationBurden.qualitySvPercentile,
      });
    }
  }, [mutationBurden]);

  useEffect(() => {
    if (tmburMutBur) {
      setNewTmburMutData({
        genomeSnvTmb: tmburMutBur.genomeSnvTmb,
        genomeIndelTmb: tmburMutBur.genomeIndelTmb,
      });
    }
  }, [tmburMutBur]);

  const handleReportChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewReportData((prevVal) => ({ ...prevVal, [name]: value }));
    setReportDirty(true);
  }, []);

  const handleMutationBurdenChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewMutationBurdenData((prevVal) => ({ ...prevVal, [name]: value }));
    setMutationBurdenDirty(true);
  }, []);

  const handleTmburChange = useCallback(({ target: { value, name } }) => {
    setNewTmburMutData((tmb) => ({
      ...tmb,
      [name]: parseFloat(value),
    }));
    setTmburMutDirty(true);
  }, []);

  const handleClose = useCallback(async (isSaved) => {
    let callSet = null;
    if (isSaved) {
      setIsApiCalling(true);
      const apiCalls = [];

      // Check if new microbialData is diff from previous
      if (microbialDirty) {
        const newMicbIds = newMicrobialData.map(({ ident }) => ident);
        const microbialIdsToDelete = microbial.filter((oldMicb) => !newMicbIds.includes(oldMicb.ident));
        const newMicbrobialEntries = newMicrobialData.filter((micbData) => !micbData.ident);
        const editedMicrobialEntries = newMicrobialData.filter(({ ident }) => Boolean(ident)).filter((micbData) => {
          const entry = microbial.find(({ ident }) => ident === micbData.ident);
          return Boolean(entry) && entry.integrationSite !== micbData.integrationSite;
        });

        microbialIdsToDelete?.forEach((entry) => {
          apiCalls.push(api.del(`/reports/${report.ident}/summary/microbial/${entry.ident}`, {}));
        });
        newMicbrobialEntries?.forEach((entry) => {
          apiCalls.push(api.post(`/reports/${report.ident}/summary/microbial`, entry, {}));
        });
        editedMicrobialEntries?.forEach(({ ident, integrationSite, species }) => {
          apiCalls.push(api.put(`/reports/${report.ident}/summary/microbial/${ident}`, { integrationSite, species }, {}));
        });
      }

      if (reportDirty && newReportData) {
        apiCalls.push(api.put(`/reports/${report.ident}`, newReportData, {}));
      } else {
        apiCalls.push({ request: () => null });
      }

      if (mutationBurdenDirty && newMutationBurdenData) {
        if (mutationBurden?.ident) {
          apiCalls.push(api.put(`/reports/${report.ident}/mutation-burden/${mutationBurden.ident}`, newMutationBurdenData, {}));
        } else {
          newMutationBurdenData.role = 'primary'; // Default role of new mutation burden data for reports with no existing analysis per ClinInfo team
          apiCalls.push(api.post(`/reports/${report.ident}/mutation-burden`, newMutationBurdenData, {}));
        }
      } else {
        apiCalls.push({ request: () => null });
      }

      if (tmburMutDirty && newTmburMutData && tmburMutBur?.ident) {
        apiCalls.push(api.put(`/reports/${report.ident}/tmbur-mutation-burden`, newTmburMutData, {}));
      } else {
        apiCalls.push({ request: () => null });
      }

      callSet = new ApiCallSet(apiCalls);

      if (isSigned) {
        showConfirmDialog(callSet);
        setIsApiCalling(false);
      } else {
        try {
          const resp = await callSet.request();
          const tmburMutResp = resp.pop();
          const primaryBurdenResp = resp.pop();
          const reportResp = resp.pop();

          // Too complicated between delete/update/new, might as well grab updated micb species for report again
          const microbialResp = await api.get(`/reports/${report.ident}/summary/microbial`).request();
          snackbar.success('Successfully updated Tumour Summary');
          onClose(
            true,
            microbialDirty ? microbialResp : null,
            reportDirty ? reportResp : null,
            mutationBurdenDirty ? primaryBurdenResp : null,
            tmburMutDirty ? tmburMutResp : null,
          );
        } catch (callSetError) {
          snackbar.error(`Error updating Tumour Summary: ${callSetError?.message}`);
          console.error(callSetError);
        } finally {
          setIsApiCalling(false);
        }
      }
    } else {
      onClose(false);
    }
    return () => callSet.abort();
  }, [
    microbialDirty,
    reportDirty,
    newReportData,
    mutationBurdenDirty,
    newMutationBurdenData,
    tmburMutDirty,
    newTmburMutData,
    isSigned,
    newMicrobialData,
    microbial,
    report?.ident,
    mutationBurden?.ident,
    tmburMutBur?.ident,
    showConfirmDialog,
    onClose,
  ]);

  const handleKeyDown = useCallback(({ code, target }) => {
    if (code === 'Backspace' && !target.value) {
      // Delete the last entry
      setNewMicrobialData((currData) => currData.slice(0, -1));
      setMicrobialDirty(true);
    }
    if (code === 'Enter') {
      // Add new entry
      setNewMicrobialData((currData) => [...currData, {
        species: target.value,
        integrationSite: 'No',
      } as MicrobialType]);
      setMicrobialDirty(true);
    }
  }, []);

  const handleClicked = useCallback((idx) => {
    setNewMicrobialData((currData) => {
      const nextData = [...currData];
      nextData[idx].integrationSite = nextData[idx].integrationSite.toLowerCase() === 'yes' ? 'No' : 'Yes';
      return nextData;
    });
    setMicrobialDirty(true);
  }, []);

  const handleDelete = useCallback((idx) => {
    setNewMicrobialData((currData) => {
      const nextData = [...currData];
      nextData.splice(idx, 1);
      return nextData;
    });
    setMicrobialDirty(true);
  }, []);

  const reportDataSection = useMemo(() => {
    if (newReportData) {
      if (reportType === 'genomic') {
        return (
          <>
            <TextField
              className="tumour-dialog__text-field"
              label="Tumour Content (%)"
              value={newReportData.tumourContent ?? ''}
              name="tumourContent"
              onChange={handleReportChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="tumour-dialog__text-field"
              label="Subtyping"
              value={newReportData.subtyping ?? ''}
              name="subtyping"
              onChange={handleReportChange}
              variant="outlined"
              multiline
              fullWidth
            />
          </>
        );
      }
      if (reportType === 'rapid') {
        return (
          <TextField
            className="tumour-dialog__text-field"
            label="Captiv 8 Score"
            value={newReportData.captiv8Score}
            name="captiv8Score"
            onChange={handleReportChange}
            variant="outlined"
            fullWidth
            type="number"
          />
        );
      }
    }
    return null;
  }, [handleReportChange, newReportData, reportType]);

  const micbDataSection = useMemo(() => {
    if (newMicrobialData) {
      return (
        <Autocomplete
          className="tumour-dialog__text-field"
          multiple
          options={[]}
          freeSolo
          value={newMicrobialData}
          disableClearable
          renderTags={(value) => value.map(({ species, integrationSite }, idx) => (
            <Chip
              // eslint-disable-next-line react/no-array-index-key
              key={`${species}-${idx}`}
              tabIndex={-1}
              label={`${species}${integrationSite.toLowerCase() === 'yes' ? ' | (integration)' : ' | (no integration)'}`}
              onClick={() => handleClicked(idx)}
              onDelete={() => handleDelete(idx)}
            />
          ))}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Microbial Species"
              name="species"
              helperText="Press enter to confirm new entry, click chip to toggle integration status"
              onKeyDown={handleKeyDown}
            />
          )}
        />
      );
    }
    return null;
  }, [handleClicked, handleDelete, handleKeyDown, newMicrobialData]);

  const mutBurDataSection = useMemo(() => {
    if (newMutationBurdenData) {
      return (
        <>
          <TextField
            className="tumour-dialog__text-field"
            label="Mutation Burden (Mut/Mb)"
            value={newMutationBurdenData.totalMutationsPerMb}
            name="totalMutationsPerMb"
            onChange={handleMutationBurdenChange}
            variant="outlined"
            fullWidth
            type="number"
          />
          <TextField
            className="tumour-dialog__text-field"
            label="SV Burden (POG average)"
            value={newMutationBurdenData.qualitySvCount}
            name="qualitySvCount"
            onChange={handleMutationBurdenChange}
            variant="outlined"
            fullWidth
            type="number"
          />
          <TextField
            className="tumour-dialog__text-field"
            label="SV Burden (Percentile)"
            value={newMutationBurdenData.qualitySvPercentile}
            name="qualitySvPercentile"
            onChange={handleMutationBurdenChange}
            variant="outlined"
            fullWidth
            type="number"
          />
        </>
      );
    }
    return (
      <>
        <TextField
          className="tumour-dialog__text-field"
          label="Mutation Burden (Mut/Mb)"
          value={null}
          name="totalMutationsPerMb"
          onChange={handleMutationBurdenChange}
          variant="outlined"
          fullWidth
          type="number"
        />
        <TextField
          className="tumour-dialog__text-field"
          label="SV Burden (POG average)"
          value={null}
          name="qualitySvCount"
          onChange={handleMutationBurdenChange}
          variant="outlined"
          fullWidth
          type="number"
        />
        <TextField
          className="tumour-dialog__text-field"
          label="SV Burden (Percentile)"
          value={null}
          name="qualitySvPercentile"
          onChange={handleMutationBurdenChange}
          variant="outlined"
          fullWidth
          type="number"
        />
      </>
    );
  }, [newMutationBurdenData, handleMutationBurdenChange]);

  const tmburMutBurSection = useMemo(() => {
    if (newTmburMutData) {
      return (
        <>
          <TextField
            className="tumour-dialog__text-field"
            label="genomeSnvTmb"
            value={newTmburMutData.genomeSnvTmb}
            name="genomeSnvTmb"
            onChange={handleTmburChange}
            variant="outlined"
            fullWidth
            type="number"
          />
          <TextField
            className="tumour-dialog__text-field"
            label="genomeIndelTmb"
            value={newTmburMutData.genomeIndelTmb}
            name="genomeIndelTmb"
            onChange={handleTmburChange}
            variant="outlined"
            fullWidth
            type="number"
          />
        </>
      );
    }
    return null;
  }, [newTmburMutData, handleTmburChange]);

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        Edit Tumour Summary
      </DialogTitle>
      <DialogContent className="tumour-dialog__content">
        {reportDataSection}
        {micbDataSection}
        {mutBurDataSection}
        {tmburMutBurSection}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>
          Close
        </Button>
        {isSigned && (
          <Button color="secondary" onClick={() => handleClose(true)}>
            Save Changes
          </Button>
        )}
        {!isSigned && (
          <AsyncButton component="label" color="secondary" onClick={() => handleClose(true)} isLoading={isApiCalling}>
            Save Changes
          </AsyncButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TumourSummaryEdit;
