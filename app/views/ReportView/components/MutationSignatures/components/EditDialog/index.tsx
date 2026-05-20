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
import snackbar from '@/services/SnackbarUtils';
import AsyncButton from '@/components/AsyncButton';

import ConfirmContext from '@/context/ConfirmContext';
import ReportContext from '@/context/ReportContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { MutationSignatureType } from '@/common';

import './index.scss';
import { useQueryClient } from 'react-query';
import { queryKeys } from '@/queries/queryKeys';

type EditDialogProps = {
  editData: MutationSignatureType;
  isOpen: boolean;
  onClose: (newData?: MutationSignatureType) => void;
};

const EditDialog = ({
  editData,
  isOpen = false,
  onClose,
}: EditDialogProps): JSX.Element => {
  const { showConfirmDialog } = useConfirmDialog();
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const [checkboxSelected, setCheckboxSelected] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [isApiCalling, setIsApiCalling] = useState(false);
  const queryClient = useQueryClient();

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
          queryClient.refetchQueries(queryKeys.reports.reportMutationSignatures(report.ident));
        } else {
          await req.request();
          queryClient.refetchQueries(queryKeys.reports.reportMutationSignatures(report.ident));
          onClose({ ...editData, selected: checkboxSelected, kbCategory: selectValue });
        }
      } catch (err) {
        snackbar.error(`Error updating signature: ${err.message}`);
        onClose();
      } finally {
        setIsApiCalling(false);
      }
    } else {
      onClose();
    }
  }, [checkboxSelected, editData, selectValue, report, isSigned, onClose, showConfirmDialog, queryClient]);

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>Edit Signature</DialogTitle>
      {/* https://github.com/mui/material-ui/issues/31185 */}
      <DialogContent sx={{ overflow: 'visible' }}>
        <FormControl className="dialog__form-control" variant="outlined" margin="normal">
          <InputLabel
            id="kbCategory-label"
            htmlFor="kbCategory-select"
          >
            kbCategory
          </InputLabel>
          <Select
            labelId="kbCategory-label"
            label="kbCategory"
            id="kbCategory-select"
            value={selectValue}
            onChange={handleSelectChange}
          >
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
      </DialogContent>
      <DialogActions className="edit-dialog__actions">
        <Button onClick={() => onClose(null)}>
          Cancel
        </Button>
        <AsyncButton isLoading={isApiCalling} color="secondary" onClick={handleSubmit}>
          Save
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
