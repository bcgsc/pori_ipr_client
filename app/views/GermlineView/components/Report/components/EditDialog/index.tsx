import React, {
  useState, useCallback, useContext, useEffect,
} from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@material-ui/core';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/components/ReportContext';

type EditDialogProps = {
  isOpen: boolean;
  onClose: (patientHistory?: string, familyHistory?: string) => void;
  rowData: Record<string, unknown>;
};

const EditDialog = ({
  isOpen = false,
  onClose,
  rowData,
}: EditDialogProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [patientHistory, setPatientHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  useEffect(() => {
    if (rowData) {
      setPatientHistory(rowData.patientHistory);
      setFamilyHistory(rowData.familyHistory);
    }
  }, [rowData]);

  const handleSaveHistory = useCallback(async () => {
    try {
      const updateFields = {};
      if (patientHistory !== rowData.patientHistory) {
        updateFields.patientHistory = patientHistory;
      }
      if (familyHistory !== rowData.familyHistory) {
        updateFields.familyHistory = familyHistory;
      }

      const newVariant = await api.put(
        `/germline-small-mutation-reports/${report.ident}/variants/${rowData.ident}`,
        updateFields,
        {},
      ).request();
      snackbar.success('Details saved');
      onClose(newVariant);
    } catch (err) {
      snackbar.error(`Error saving details: ${err}`);
    }
  }, [familyHistory, onClose, patientHistory, report, rowData]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={() => onClose()}
      open={isOpen}
    >
      <DialogTitle>
        Edit Row
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Patient History"
          margin="normal"
          multiline
          onChange={(event) => setPatientHistory(event.target.value)}
          value={patientHistory}
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Family History"
          margin="normal"
          multiline
          onChange={(event) => setFamilyHistory(event.target.value)}
          value={familyHistory}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button
          color="secondary"
          disabled={patientHistory === rowData?.patientHistory && familyHistory === rowData?.familyHistory}
          onClick={handleSaveHistory}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
