import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
} from '@material-ui/core';

import { updateMutationSignature } from '@/services/reports/mutation-signature';

import './index.scss';
import { useCallback } from 'react';
import ReportContext from '../../../ReportContext';

const EditDialog = (props) => {
  const {
    editData,
    isOpen,
    onClose,
    showErrorSnackbar,
  } = props;

  const { report } = useContext(ReportContext);
  const [checkboxSelected, setCheckboxSelected] = useState(false);
  const [selectValue, setSelectValue] = useState('');

  useEffect(() => {
    if (editData) {
      setCheckboxSelected(editData.selected);
      setSelectValue(editData.kbCategory);
    }
  }, [editData]);

  const handleCheckboxChange = (event) => {
    setCheckboxSelected(event.target.checked);
  };

  const handleSelectChange = (event) => {
    setSelectValue(event.target.value);
  };

  const handleSubmit = useCallback(async () => {
    if (checkboxSelected !== editData.selected || selectValue !== editData.kbCategory) {
      try {
        await updateMutationSignature(
          report.ident,
          editData.ident,
          { selected: checkboxSelected, kbCategory: selectValue },
        );
        onClose({ ...editData, selected: checkboxSelected, kbCategory: selectValue });
      } catch (err) {
        showErrorSnackbar(`Error updating signature: ${err.message}`);
        onClose();
      }
    } else {
      onClose();
    }
  }, [checkboxSelected, selectValue]);

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>Edit Signature</DialogTitle>
      <DialogContent>
        <FormControl className="dialog__form-control">
          <InputLabel>kbCategory</InputLabel>
          <Select value={selectValue} onChange={handleSelectChange}>
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="slight">Slight</MenuItem>
            <MenuItem value="moderate">Moderate</MenuItem>
            <MenuItem value="strong">Strong</MenuItem>
          </Select>
        </FormControl>
        <div>
          <FormControlLabel
            label="Include this signature on the front page?"
            control={
              <Checkbox checked={checkboxSelected} onChange={handleCheckboxChange} />
            }
          />
        </div>
        <DialogActions className="edit-dialog__actions">
          <Button onClick={() => handleSubmit()}>
            Cancel
          </Button>
          <Button color="secondary" onClick={() => handleSubmit()}>
            Save
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
