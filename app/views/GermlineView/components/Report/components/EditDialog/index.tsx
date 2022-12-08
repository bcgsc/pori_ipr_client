import React, {
  useCallback, useContext,
} from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Select,
  InputLabel,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import GermlineReportContext, { VariantType } from '@/context/GermlineReportContext';

const CGL_REVIEW_RESULTS_OPTIONS = ['pathogenic', 'likely pathogenic', 'VUS', 'likely benign', 'benign'];

type EditDialogProps = {
  isOpen: boolean;
  onClose: (patientHistory?: string, familyHistory?: string) => void;
  rowData: VariantType;
};

const EditDialog = ({
  isOpen = false,
  onClose,
  rowData,
}: EditDialogProps): JSX.Element => {
  const { report } = useContext(GermlineReportContext);
  const {
    handleSubmit,
    control,
    formState: { isDirty, dirtyFields },
  } = useForm();

  const saveHistory = useCallback(async (data) => {
    try {
      const updateFields: Record<string, unknown> = {};
      Object.keys(data).forEach((key) => {
        if (dirtyFields[key]) {
          updateFields[key] = data[key];
        }
      });

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
  }, [onClose, report, rowData, dirtyFields]);

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
        <Controller
          control={control}
          name="patientHistory"
          render={({ field: { onChange, value } }) => (
            <TextField
              fullWidth
              label="Patient History"
              margin="normal"
              multiline
              onChange={onChange}
              value={value}
              defaultValue={rowData.patientHistory}
              variant="outlined"
            />
          )}
        />
        <Controller
          control={control}
          name="familyHistory"
          render={({ field: { onChange, value } }) => (
            <TextField
              fullWidth
              label="Family History"
              margin="normal"
              multiline
              onChange={onChange}
              value={value}
              defaultValue={rowData.familyHistory}
              variant="outlined"
            />
          )}
        />
        <Controller
          control={control}
          name="cglReviewResult"
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth margin="normal">
              <InputLabel id="cglReviewResult">CGL Review Result</InputLabel>
              <Select
                fullWidth
                label="CGL Review Result"
                labelId="cglReviewResult"
                onChange={onChange}
                value={value ?? ''}
                defaultValue={rowData.cglReviewResult}
                variant="outlined"
              >
                {CGL_REVIEW_RESULTS_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="returnedToClinician"
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Returned to Clinician</FormLabel>
              <RadioGroup
                onChange={onChange}
                defaultValue={rowData.returnedToClinician}
                value={value ?? null}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="referralHCP"
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Referral HCP</FormLabel>
              <RadioGroup
                onChange={onChange}
                defaultValue={rowData.referralHcp}
                value={value ?? null}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="knownToHCP"
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Known to HCP</FormLabel>
              <RadioGroup
                onChange={onChange}
                defaultValue={rowData.knownToHcp}
                value={value ?? null}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="reasonNoHcpReferral"
          render={({ field: { onChange, value } }) => (
            <TextField
              fullWidth
              label="Reason no HCP referral"
              margin="normal"
              multiline
              onChange={onChange}
              value={value}
              defaultValue={rowData.reasonNoHcpReferral}
              variant="outlined"
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button
          color="secondary"
          disabled={!isDirty}
          onClick={handleSubmit(saveHistory)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
