import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Button,
} from '@material-ui/core';

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
  const [newMicrobialData, setNewMicrobialData] = useState({});
  const [newReportData, setNewReportData] = useState({});
  const [newMutationBurdenData, setNewMutationBurdenData] = useState({});
  const [microbialDirty, setMicrobialDirty] = useState(false);
  const [reportDirty, setReportDirty] = useState(false);
  const [mutationBurdenDirty, setMutationBurdenDirty] = useState(false);

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

  const handleMicrobialChange = (event) => {
    const { target: { value, name } } = event;
    setNewMicrobialData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!microbialDirty) {
      setMicrobialDirty(true);
    }
  };

  const handleReportChange = (event) => {
    const { target: { value, name } } = event;
    setNewReportData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!reportDirty) {
      setReportDirty(true);
    }
  };

  const handleMutationBurdenChange = (event) => {
    const { target: { value, name } } = event;
    setNewMutationBurdenData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!mutationBurdenDirty) {
      setMutationBurdenDirty(true);
    }
  };

  const handleClose = useCallback((isSaved) => {
    if (isSaved) {
      onClose(
        true,
        microbialDirty ? newMicrobialData : null,
        reportDirty ? newReportData : null,
        mutationBurdenDirty ? newMutationBurdenData : null,
      );
    } else {
      onClose(false);
    }
  }, [newMicrobialData, newReportData, newMutationBurdenData, mutationBurdenDirty, microbialDirty, reportDirty, onClose]);

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
        <Button color="secondary" onClick={() => handleClose(true)}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TumourSummaryEdit;
