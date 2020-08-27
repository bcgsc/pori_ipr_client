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

const PatientEdit = (props) => {
  const {
    microbial,
    report,
    isOpen,
    onClose,
  } = props;

  const [newMicrobialData, setNewMicrobialData] = useState();
  const [newReportData, setNewReportData] = useState();
  const [microbialDirty, setMicrobialDirty] = useState(false);
  const [reportDirty, setReportDirty] = useState(false);

  useEffect(() => {
    if (microbial) {
      setNewPatientData(microbial);
    }
  }, [microbial]);

  useEffect(() => {
    if (report) {
      setNewReportData(report);
    }
  }, [report]);

  const handleMicrobialChange = (event) => {
    const { target: { value, name } } = event;
    setNewMicrobialData(prevVal => ({...prevVal, [name]: value }));

    if (!microbialDirty) {
      setMicrobialDirty(true);
    }
  };

  const handleReportChange = (event) => {
    const { target: { value, name } } = event;
    setNewReportData(prevVal => ({...prevVal, [name]: value }));

    if (!reportDirty) {
      setReportDirty(true)
    }
  };

  const handleClose = useCallback((isSaved) => {
    if (isSaved) {
      onClose(true, microbialDirty ? newMicrobialData : null, reportDirty ? newReportData : null);
    } else {
      onClose(false);
    }
  }, [newMicrobialData, newReportData])

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        Edit Tumour Summary
      </DialogTitle>
      <DialogContent className="patient-dialog__content">
        {newMicrobialData && newReportData && (
          <>
            <TextField
              className="patient-dialog__text-field"
              label="Tumour Content"
              value={newReportData.tumourContent}
              name="tumourContent"
              onChange={handleReportChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="Subtyping"
              value={newReportData.subtyping}
              name="subtyping"
              onChange={handleReportChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="Case Type"
              value={newMicrobialData.species}
              name="caseType"
              onChange={handleMicrobialChange}
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
  )
}

export default PatientEdit;