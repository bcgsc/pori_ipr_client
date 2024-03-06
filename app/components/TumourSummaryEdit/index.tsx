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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { pink } from '@mui/material/colors';
import cloneDeep from 'lodash/cloneDeep';
import api, { ApiCallSet } from '@/services/api';
import ConfirmContext from '@/context/ConfirmContext';
import AsyncButton from '@/components/AsyncButton';
import useConfirmDialog from '@/hooks/useConfirmDialog';

import './index.scss';
import { ReportType } from '@/context/ReportContext';
import {
  ImmuneType, MicrobialType, MutationBurdenType, TmburType,
} from '@/common';
import snackbar from '@/services/SnackbarUtils';

type TumourSummaryEditProps = {
  microbial: MicrobialType[];
  report: ReportType;
  tCellCd8: ImmuneType;
  mutationBurden: MutationBurdenType;
  tmburMutBur: TmburType;
  isOpen: boolean;
  onClose: (
    isSaved: boolean,
    newMicrobialData?: MicrobialType[],
    newReportData?: ReportType,
    newTCellCd8Data?: ImmuneType,
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
  tCellCd8,
  mutationBurden,
  tmburMutBur,
  isOpen,
  onClose,
}: TumourSummaryEditProps): JSX.Element => {
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();

  const [newMicrobialData, setNewMicrobialData] = useState(cloneDeep(microbial));
  const [newReportData, setNewReportData] = useState<Partial<ReportType>>(null);
  const [newTCellCd8Data, setNewTCellCd8Data] = useState<Partial<ImmuneType>>(null);
  const [newMutationBurdenData, setNewMutationBurdenData] = useState<Partial<MutationBurdenType>>(null);
  const [newTmburMutData, setNewTmburMutData] = useState<Partial<TmburType>>(null);
  const [microbialDirty, setMicrobialDirty] = useState(false);
  const [reportDirty, setReportDirty] = useState(false);
  const [tCellCd8Dirty, setTCellCd8Dirty] = useState(false);
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
    if (tCellCd8) {
      setNewTCellCd8Data({
        score: tCellCd8.score,
        percentile: tCellCd8.percentile,
      });
    }
  }, [tCellCd8]);

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
        adjustedTmb: tmburMutBur.adjustedTmb,
        adjustedTmbComment: tmburMutBur.adjustedTmbComment,
        tmbHidden: tmburMutBur.tmbHidden,
      });
    }
  }, [tmburMutBur]);

  const handleReportChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewReportData((prevVal) => ({ ...prevVal, [name]: value }));
    setReportDirty(true);
  }, []);

  const handleTCellCd8Change = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewTCellCd8Data((prevVal) => ({ ...prevVal, [name]: value }));
    setTCellCd8Dirty(true);
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

  const handleAdjustedTmbCommentChange = useCallback(({ target: { value, name } }) => {
    setNewTmburMutData((tmb) => ({
      ...tmb,
      [name]: value,
    }));
    setTmburMutDirty(true);
  }, []);

  const handleAdjustedTmbVisibleChange = useCallback(({ target: { checked, name } }) => {
    setNewTmburMutData((tmb) => ({
      ...tmb,
      [name]: checked,
    }));
    setTmburMutDirty(true);
  }, []);

  const handleClose = useCallback(async (isSaved) => {
    let callSet = null;
    if (!!newTmburMutData.adjustedTmb && !newTmburMutData.adjustedTmbComment) {
      snackbar.warning('Please add a comment on the adjusted TMB');
      isSaved = false;
      onClose(false);
    }
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
      }

      if (tCellCd8Dirty && newTCellCd8Data) {
        if (tCellCd8?.ident) {
          apiCalls.push(api.put(`/reports/${report.ident}/immune-cell-types/${tCellCd8.ident}`, newTCellCd8Data, {}));
        } else {
          apiCalls.push(api.post(`/reports/${report.ident}/immune-cell-types`, { ...newTCellCd8Data, cellType: 'T cells CD8' }, {}));
        }
      } else {
        apiCalls.push({ request: () => null });
      }

      if (mutationBurdenDirty && newMutationBurdenData) {
        if (mutationBurden?.ident) {
          apiCalls.push(api.put(`/reports/${report.ident}/mutation-burden/${mutationBurden.ident}`, newMutationBurdenData, {}));
        } else {
          apiCalls.push(api.post(
            `/reports/${report.ident}/mutation-burden`,
            { ...newMutationBurdenData, role: 'primary' },
            {},
          ));
        }
      }

      if (tmburMutDirty && newTmburMutData) {
        if (tmburMutBur?.ident) {
          apiCalls.push(api.put(`/reports/${report.ident}/tmbur-mutation-burden`, newTmburMutData, {}));
        } else {
          apiCalls.push(api.post(`/reports/${report.ident}/tmbur-mutation-burden`, newTmburMutData, {}));
        }
      }

      callSet = new ApiCallSet(apiCalls);

      if (isSigned) {
        showConfirmDialog(callSet);
        setIsApiCalling(false);
      } else {
        try {
          await callSet.request();

          let microbialResp = null;
          let immuneResp = null;
          let tmburMutResp = null;
          let mutationBurdenResp = null;
          let reportResp = null;

          if (microbialDirty) {
            microbialResp = await api.get(`/reports/${report.ident}/summary/microbial`).request();
          }
          if (tCellCd8Dirty) {
            immuneResp = await api.get(`/reports/${report.ident}/immune-cell-types`).request();
          }
          if (tmburMutDirty) {
            tmburMutResp = await api.get(`/reports/${report.ident}/tmbur-mutation-burden`).request();
          }
          if (mutationBurdenDirty) {
            mutationBurdenResp = await api.get(`/reports/${report.ident}/mutation-burden`).request();
          }
          if (reportDirty) {
            reportResp = await api.get(`/reports/${report.ident}`).request();
          }

          snackbar.success('Successfully updated Tumour Summary');
          onClose(
            true,
            microbialDirty ? microbialResp : null,
            reportDirty ? reportResp : null,
            tCellCd8Dirty ? immuneResp.find(({ cellType }) => cellType === 'T cells CD8') : null,
            mutationBurdenDirty ? mutationBurdenResp.find((mb) => mb.role === 'primary') : null,
            tmburMutDirty ? tmburMutResp : null,
          );
        } catch (callSetError) {
          snackbar.error(`Error updating Tumour Summary: ${callSetError?.message}`);
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
    tCellCd8Dirty,
    newTCellCd8Data,
    mutationBurdenDirty,
    newMutationBurdenData,
    tmburMutDirty,
    newTmburMutData,
    isSigned,
    newMicrobialData,
    microbial,
    report?.ident,
    tCellCd8?.ident,
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

  const tCellCd8DataSection = useMemo(() => (
    <>
      <TextField
        className="tumour-dialog__text-field"
        label="CD8+ T Cell Score"
        value={newTCellCd8Data?.score ?? null}
        name="score"
        onChange={handleTCellCd8Change}
        variant="outlined"
        fullWidth
        type="number"
      />
      <TextField
        className="tumour-dialog__text-field"
        label="CD8+ T Cell Percentile"
        value={newTCellCd8Data?.percentile ?? null}
        name="percentile"
        onChange={handleTCellCd8Change}
        variant="outlined"
        fullWidth
        type="number"
      />
    </>
  ), [newTCellCd8Data, handleTCellCd8Change]);

  const mutBurDataSection = useMemo(() => (
    <>
      <TextField
        className="tumour-dialog__text-field"
        label="Mutation Burden (Mut/Mb)"
        value={newMutationBurdenData?.totalMutationsPerMb ?? null}
        name="totalMutationsPerMb"
        onChange={handleMutationBurdenChange}
        variant="outlined"
        fullWidth
        type="number"
      />
      <TextField
        className="tumour-dialog__text-field"
        label="SV Burden (POG average)"
        value={newMutationBurdenData?.qualitySvCount ?? null}
        name="qualitySvCount"
        onChange={handleMutationBurdenChange}
        variant="outlined"
        fullWidth
        type="number"
      />
      <TextField
        className="tumour-dialog__text-field"
        label="SV Burden (Percentile)"
        value={newMutationBurdenData?.qualitySvPercentile ?? null}
        name="qualitySvPercentile"
        onChange={handleMutationBurdenChange}
        variant="outlined"
        fullWidth
        type="number"
      />
    </>
  ), [newMutationBurdenData, handleMutationBurdenChange]);

  const tmburMutBurSection = useMemo(() => (
    <>
      <TextField
        className="tumour-dialog__text-field"
        label="genomeSnvTmb"
        value={newTmburMutData?.genomeSnvTmb ?? null}
        name="genomeSnvTmb"
        onChange={handleTmburChange}
        variant="outlined"
        fullWidth
        type="number"
      />
      <TextField
        className="tumour-dialog__text-field"
        label="genomeIndelTmb"
        value={newTmburMutData?.genomeIndelTmb ?? null}
        name="genomeIndelTmb"
        onChange={handleTmburChange}
        variant="outlined"
        fullWidth
        type="number"
      />
      <TextField
        className="tumour-dialog__text-field"
        label="Adjusted TMB"
        value={newTmburMutData?.adjustedTmb ?? null}
        name="adjustedTmb"
        onChange={handleTmburChange}
        variant="outlined"
        fullWidth
        type="number"
      />
      <TextField
        className="tumour-dialog__text-field"
        label="Adjusted TMB Comment"
        value={newTmburMutData?.adjustedTmbComment ?? ''}
        name="adjustedTmbComment"
        disabled={!newTmburMutData?.adjustedTmb && !newTmburMutData?.adjustedTmbComment}
        required={!!newTmburMutData?.adjustedTmb}
        onChange={handleAdjustedTmbCommentChange}
        variant="outlined"
        fullWidth
        type="text"
      />
      <FormControlLabel
        className="tumour-dialog__check-box"
        control={(
          <Checkbox
            icon={<Visibility />}
            checkedIcon={<VisibilityOff />}
            checked={newTmburMutData?.tmbHidden}
            name="tmbHidden"
            onChange={handleAdjustedTmbVisibleChange}
            sx={{
              color: 'default',
              '&.Mui-checked': {
                color: pink[800],
              },
            }}
          />
        )}
        label="Show/Hide TMB Score"
      />
    </>
  ), [newTmburMutData?.genomeSnvTmb, newTmburMutData?.genomeIndelTmb, newTmburMutData?.adjustedTmb, newTmburMutData?.adjustedTmbComment, newTmburMutData?.tmbHidden, handleTmburChange, handleAdjustedTmbCommentChange, handleAdjustedTmbVisibleChange]);

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        Edit Tumour Summary
      </DialogTitle>
      <DialogContent className="tumour-dialog__content">
        {reportDataSection}
        {micbDataSection}
        {tCellCd8DataSection}
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
