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
    patientInformation,
    report,
    isOpen,
    onClose,
  } = props;

  const [newPatientData, setNewPatientData] = useState();
  const [newReportData, setNewReportData] = useState();
  const [patientDirty, setPatientDirty] = useState(false);
  const [reportDirty, setReportDirty] = useState(false);

  useEffect(() => {
    if (patientInformation) {
      setNewPatientData(patientInformation);
    }
  }, [patientInformation]);

  useEffect(() => {
    if (report) {
      setNewReportData(report);
    }
  }, [report]);

  const handlePatientChange = (event) => {
    const { target: { value, name } } = event;
    setNewPatientData(prevVal => ({...prevVal, [name]: value }));

    if (!patientDirty) {
      setPatientDirty(true);
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
      onClose(true, patientDirty ? newPatientData : null, reportDirty ? newReportData : null);
    } else {
      onClose(false);
    }
  }, [newPatientData, newReportData])

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        Edit Patient Information
      </DialogTitle>
      <DialogContent className="patient-dialog__content">
        {newPatientData && newReportData && (
          <>
            <TextField
              className="patient-dialog__text-field"
              label="Alternate ID"
              value={newReportData.alternateIdentifier}
              name="alternateIdentifier"
              onChange={handleReportChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="Case Type"
              value={newPatientData.caseType}
              name="caseType"
              onChange={handlePatientChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="Physician"
              value={newPatientData.physician}
              name="physician"
              onChange={handlePatientChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="Biopsy Name"
              value={newReportData.biopsyName}
              name="biopsyName"
              onChange={handleReportChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="Biopsy Details"
              value={newPatientData.biopsySite}
              name="biopsySite"
              onChange={handlePatientChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="Sex"
              value={newPatientData.gender}
              name="gender"
              onChange={handlePatientChange}
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