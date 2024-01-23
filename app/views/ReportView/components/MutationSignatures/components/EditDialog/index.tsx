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
} from '@mui/material';

import api from '@/services/api';
import AsyncButton from '@/components/AsyncButton';

import ConfirmContext from '@/context/ConfirmContext';
import ReportContext from '@/context/ReportContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import SignatureType from '../../types';

import './index.scss';

type EditDialogProps = {
  editData: SignatureType;
  isOpen: boolean;
  onClose: (newData?: SignatureType) => void;
  showErrorSnackbar: (message: string) => void;
};

const EditDialog = ({
  editData,
  isOpen = false,
  onClose,
  showErrorSnackbar,
}: EditDialogProps): JSX.Element => {
  const { showConfirmDialog } = useConfirmDialog();
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const [checkboxSelected, setCheckboxSelected] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [isApiCalling, setIsApiCalling] = useState(false);

  useEffect(() => {
    if (editData) {
      setCheckboxSelected(editData.selected);
      setSelectValue(editData.kbCategory);
    }
  }, [editData]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxSelected(event.target.checked);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectValue(event.target.value);
  };

  const handleSubmit = useCallback(async () => {
    if (checkboxSelected !== editData.selected || selectValue !== editData.kbCategory) {
      setIsApiCalling(true);
      const req = api.put(
        `/reports/${report.ident}/mutation-signatures/${editData.ident}`,
        { selected: checkboxSelected, kbCategory: selectValue },
        {},
      );
      try {
        if (isSigned) {
          showConfirmDialog(req);
          setIsApiCalling(false);
        } else {
          await req.request();
          onClose({ ...editData, selected: checkboxSelected, kbCategory: selectValue });
        }
      } catch (err) {
        showErrorSnackbar(`Error updating signature: ${err.message}`);
        onClose();
      } finally {
        setIsApiCalling(false);
      }
    } else {
      onClose();
    }
  }, [checkboxSelected, editData, selectValue, report, isSigned, onClose, showErrorSnackbar, showConfirmDialog]);

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
          <Button onClick={handleSubmit}>
            Cancel
          </Button>
          <AsyncButton isLoading={isApiCalling} color="secondary" onClick={handleSubmit}>
            Save
          </AsyncButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
