import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
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

import api from '@/services/api';

import './index.scss';
import ReportContext from '../../../../../../components/ReportContext';
import ConfirmContext from '@/components/ConfirmContext';

const EditDialog = (props) => {
  const {
    editData,
    isOpen,
    onClose,
    showErrorSnackbar,
  } = props;

  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
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
        await api.put(
          `/reports/${report.ident}/mutation-signatures/${editData.ident}`,
          { selected: checkboxSelected, kbCategory: selectValue },
        ).request(isSigned);
        onClose({ ...editData, selected: checkboxSelected, kbCategory: selectValue });
      } catch (err) {
        showErrorSnackbar(`Error updating signature: ${err.message}`);
        onClose();
      }
    } else {
      onClose();
    }
  }, [checkboxSelected, editData, selectValue, report, isSigned, onClose, showErrorSnackbar]);

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
