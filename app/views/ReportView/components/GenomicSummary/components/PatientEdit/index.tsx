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
} from '@material-ui/core';

import api, { ApiCallSet } from '@/services/api';
import ConfirmContext from '@/context/ConfirmContext';
import AsyncButton from '@/components/AsyncButton';

import './index.scss';

type PatientEditProps = {
  patientInformation: Record<string, unknown>;
  report: Record<string, unknown>;
  isOpen: boolean;
  onClose: (
    isSaved: boolean,
    newPatientData?: Record<string, unknown> | null,
    newReportData?: Record<string, unknown> | null
  ) => void;
};

const PatientEdit = ({
  patientInformation,
  report,
  isOpen,
  onClose,
}: PatientEditProps): JSX.Element => {
  const { isSigned } = useContext(ConfirmContext);

  const [newPatientData, setNewPatientData] = useState();
  const [newReportData, setNewReportData] = useState();
  const [patientDirty, setPatientDirty] = useState(false);
  const [reportDirty, setReportDirty] = useState(false);
  const [isApiCalling, setIsApiCalling] = useState(false);

  useEffect(() => {
    if (patientInformation) {
      setNewPatientData(patientInformation);
    }
  }, [patientInformation]);

  useEffect(() => {
    if (report) {
      setNewReportData({
        alternateIdentifier: report.alternateIdentifier,
        biopsyName: report.biopsyName,
      });
    }
  }, [report]);

  const handlePatientChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewPatientData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!patientDirty) {
      setPatientDirty(true);
    }
  }, [patientDirty]);

  const handleReportChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewReportData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!reportDirty) {
      setReportDirty(true);
    }
  }, [reportDirty]);

  const handleClose = useCallback(async (isSaved) => {
    if (isSaved) {
      setIsApiCalling(true);
      const apiCalls = [];

      if (newPatientData) {
        apiCalls.push(api.put(`/reports/${report.ident}/patient-information`, newPatientData, {}));
      }

      if (newReportData) {
        apiCalls.push(api.put(`/reports/${report.ident}`, newReportData, {}));
      }

      const callSet = new ApiCallSet(apiCalls);
      await callSet.request(isSigned);

      setIsApiCalling(false);
      onClose(true, patientDirty ? newPatientData : null, reportDirty ? newReportData : null);
    } else {
      onClose(false);
    }
  }, [newPatientData, newReportData, isSigned, onClose, patientDirty, reportDirty, report.ident]);

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
              label="Gender"
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
        <AsyncButton color="secondary" onClick={() => handleClose(true)} isLoading={isApiCalling}>
          Save Changes
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

export default PatientEdit;
