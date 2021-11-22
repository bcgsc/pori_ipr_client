import React, {
  useState, useEffect, useCallback, useContext,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Button,
} from '@mui/material';

import api, { ApiCallSet } from '@/services/api';
import ConfirmContext from '@/context/ConfirmContext';
import AsyncButton from '@/components/AsyncButton';
import { ReportType } from '@/context/ReportContext';
import { MicrobialType } from '../../types';
import { MutationBurdenType } from '../../../MutationBurden/types';

import './index.scss';

type TumourSummaryEditProps = {
  microbial: any;
  report: any;
  mutationBurden: any;
  isOpen: any;
  onClose: any;
};

const TumourSummaryEdit = ({
  microbial,
  report,
  mutationBurden,
  isOpen,
  onClose,
}: TumourSummaryEditProps): JSX.Element => {
  const { isSigned } = useContext(ConfirmContext);

  const [newMicrobialData, setNewMicrobialData] = useState({});
  const [newReportData, setNewReportData] = useState({});
  const [newMutationBurdenData, setNewMutationBurdenData] = useState({});
  const [microbialDirty, setMicrobialDirty] = useState(false);
  const [reportDirty, setReportDirty] = useState(false);
  const [mutationBurdenDirty, setMutationBurdenDirty] = useState(false);
  const [isApiCalling, setIsApiCalling] = useState(false);

  useEffect(() => {
    if (microbial) {
      setNewMicrobialData({ species: microbial.species });
    }
  }, [microbial]);

  useEffect(() => {
    if (report) {
      setNewReportData({
        tumourContent: report.tumourContent,
        subtyping: report.subtyping,
      });
    }
  }, [report]);

  useEffect(() => {
    if (mutationBurden) {
      setNewMutationBurdenData({
        totalMutationsPerMb: mutationBurden.totalMutationsPerMb,
      });
    }
  }, [mutationBurden]);

  const handleMicrobialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewMicrobialData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!microbialDirty) {
      setMicrobialDirty(true);
    }
  };

  const handleReportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewReportData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!reportDirty) {
      setReportDirty(true);
    }
  };

  const handleMutationBurdenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewMutationBurdenData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!mutationBurdenDirty) {
      setMutationBurdenDirty(true);
    }
  };

  const handleClose = useCallback(async (isSaved) => {
    if (isSaved) {
      setIsApiCalling(true);
      const apiCalls = [];

      if (newMicrobialData) {
        if (microbial?.ident) {
          apiCalls.push(api.put<MicrobialType>(`/reports/${report.ident}/summary/microbial/${microbial.ident}`, newMicrobialData));
        } else {
          apiCalls.push(api.post<MicrobialType>(`/reports/${report.ident}/summary/microbial`, newMicrobialData));
        }
      } else {
        apiCalls.push({ request: () => null });
      }

      if (newReportData) {
        apiCalls.push(api.put<ReportType>(`/reports/${report.ident}`, newReportData));
      } else {
        apiCalls.push({ request: () => null });
      }

      if (newMutationBurdenData) {
        if (mutationBurden?.ident) {
          apiCalls.push(api.put<MutationBurdenType>(`/reports/${report.ident}/mutation-burden/${mutationBurden.ident}`, newMutationBurdenData));
        } else {
          apiCalls.push(api.post<MutationBurdenType>(`/reports/${report.ident}/mutation-burden`, newMutationBurdenData));
        }
      }

      const callSet = new ApiCallSet(apiCalls);
      const [microbialResp, reportResp, primaryBurdenResp] = await callSet.request(isSigned);

      setIsApiCalling(false);
      onClose(
        true,
        microbialDirty ? microbialResp : null,
        reportDirty ? reportResp : null,
        mutationBurdenDirty ? primaryBurdenResp : null,
      );
    } else {
      onClose(false);
    }
  }, [newMicrobialData, newReportData, newMutationBurdenData, isSigned, onClose, microbialDirty, reportDirty, mutationBurdenDirty, microbial, report.ident, mutationBurden]);

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        Edit Tumour Summary
      </DialogTitle>
      <DialogContent className="tumour-dialog__content">
        {newMicrobialData && newReportData && newMutationBurdenData && (
          <>
            <TextField
              className="tumour-dialog__text-field"
              label="Tumour Content (%)"
              value={newReportData.tumourContent}
              name="tumourContent"
              onChange={handleReportChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="tumour-dialog__text-field"
              label="Subtyping"
              value={newReportData.subtyping}
              name="subtyping"
              onChange={handleReportChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="tumour-dialog__text-field"
              label="Microbial Species"
              value={newMicrobialData.species}
              name="species"
              onChange={handleMicrobialChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="tumour-dialog__text-field"
              label="Mutation Burden (Mut/Mb)"
              value={newMutationBurdenData.totalMutationsPerMb}
              name="totalMutationsPerMb"
              onChange={handleMutationBurdenChange}
              variant="outlined"
              multiline
              fullWidth
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>
          Close
        </Button>
        <AsyncButton color="secondary" onClick={() => handleClose(true)} isLoading={isApiCalling}>
          Save Changes
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

export default TumourSummaryEdit;
