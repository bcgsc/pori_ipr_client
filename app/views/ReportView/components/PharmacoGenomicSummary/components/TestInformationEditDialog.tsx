import React, { useCallback, useContext, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { TestInformationType } from '@/components/TestInformation';
import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';

type TestInformationForm = TestInformationType;

type TestInformationEditDialogProps = {
  data: TestInformationType;
  isOpen: boolean;
  onClose: (data: TestInformationType | null) => void;
};

const TestInformationEditDialog = ({
  data,
  isOpen,
  onClose,
}: TestInformationEditDialogProps) => {
  const { report: { ident: reportId } } = useContext(ReportContext);
  const {
    register, handleSubmit, formState: { dirtyFields }, setValue,
  } = useForm<TestInformationForm>({
    mode: 'onBlur',
    defaultValues: {
      pharmacogenomicGenes: 0,
      pharmacogenomicVars: 0,
    },
  });

  useEffect(() => {
    if (data) {
      setValue('pharmacogenomicGenes', Number(data.pharmacogenomicGenes));
      setValue('pharmacogenomicVars', Number(data.pharmacogenomicVars));
    }
  }, [data, setValue]);

  const handleClose = useCallback(() => {
    onClose(null);
  }, [onClose]);

  const handleConfirm = useCallback(async (values: Pick<TestInformationType, 'pharmacogenomicGenes' | 'pharmacogenomicVars'>) => {
    if (Object.keys(dirtyFields).length > 0) {
      try {
        const resp = await api.put(`/reports/${reportId}/probe-test-information`, { ...values }).request();
        snackbar.success('Successfully edited test information');
        onClose(resp);
      } catch (e) {
        snackbar.error('Failed to edit test information: ', e.message ?? e);
        onClose(null);
      }
    } else {
      onClose(null);
    }
  }, [onClose, reportId, dirtyFields]);

  return (
    <Dialog fullWidth open={isOpen} onClose={handleClose}>
      <DialogTitle>Edit Test Information</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Pharmacogenomic Genes Screened"
          type="number"
          fullWidth
          {...register('pharmacogenomicGenes', { required: true, valueAsNumber: true })}
        />
        <TextField
          margin="dense"
          label="Pharmacogenomic Variants Screened"
          type="number"
          fullWidth
          {...register('pharmacogenomicVars', { required: true, valueAsNumber: true })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(handleConfirm)} color="secondary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestInformationEditDialog;
export { TestInformationEditDialogProps, TestInformationEditDialog };
