import React, { useCallback, useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { TestInformationType } from '@/components/TestInformation';

type TestInformationEditDialogProps = {
  data: TestInformationType;
  isOpen: boolean;
  onClose: () => void;
};

const TestInformationEditDialog = ({
  data,
  isOpen,
  onClose,
}: TestInformationEditDialogProps) => {
  // Input field states
  const [genesScreened, setGenesScreened] = useState('');
  const [variantsScreened, setVariantsScreened] = useState('');

  // Input change handlers
  const handleGenesScreenedChange = (event) => setGenesScreened(event.target.value);
  const handleVariantsScreenedChange = (event) => setVariantsScreened(event.target.value);

  // Open and Close actions
  const handleClose = useCallback(() => {
    onClose(null);
  }, [onClose]);

  const handleConfirm = useCallback(async () => {
    // API calls here
    onClose(true);
  }, [onClose]);

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Test Information</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="genesScreened"
          label="Pharmacogenomic Genes Screened"
          type="number"
          value={genesScreened}
          onChange={handleGenesScreenedChange}
          fullWidth
        />
        <TextField
          margin="dense"
          id="variantsScreened"
          label="Pharmacogenomic Variants Screened"
          type="number"
          value={variantsScreened}
          onChange={handleVariantsScreenedChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="secondary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestInformationEditDialog;
