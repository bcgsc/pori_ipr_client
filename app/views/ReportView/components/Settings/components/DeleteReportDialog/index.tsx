import React, { useState, useContext, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';

import ReportContext from '@/context/ReportContext';

import './index.scss';

type DeleteReportDialogProps = {
  isOpen: boolean;
  onClose: (confirmed?: boolean) => void;
};

const DeleteReportDialog = ({
  isOpen,
  onClose,
}: DeleteReportDialogProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const [confirmationInput, setConfirmationInput] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setConfirmationInput('');
    }
  }, [isOpen]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationInput(event.target.value);
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>
        Delete Report
      </DialogTitle>
      <DialogContent>
        <div className="delete-report__content">
          <Typography variant="h5">Are you sure you want to delete this report?</Typography>
          <div className="delete-report__info">
            <Typography>{`Patient: ${report.patientId}`}</Typography>
            <Typography>{`Report Ident: ${report.ident}`}</Typography>
          </div>
          <Typography>Please type the Patient ID to confirm deletion</Typography>
        </div>
        <TextField
          fullWidth
          label="Patient ID"
          onChange={handleTextChange}
          required
          value={confirmationInput}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose()}
        >
          Cancel
        </Button>
        <Button
          classes={{ root: 'delete-report__button--warn' }}
          disabled={report.patientId.toLowerCase() !== confirmationInput.toLowerCase()}
          onClick={() => onClose(true)}
          variant="outlined"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteReportDialog;
