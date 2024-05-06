import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

import api from '@/services/api';
import AsyncButton from '@/components/AsyncButton';

import snackbar from '@/services/SnackbarUtils';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { UserType } from '@/common';

import './index.scss';

type UserSettingsDialogProps = {
  editData: Partial<UserType>;
  isOpen: boolean;
  onClose: (newData?: Partial<UserType>) => void;
  showErrorSnackbar: (message: string) => void;
};

const UserSettingsDialog = ({
  editData,
  isOpen = false,
  onClose,
  showErrorSnackbar,
}: UserSettingsDialogProps): JSX.Element => {
  const { showConfirmDialog } = useConfirmDialog();
  const { isSigned } = useContext(ConfirmContext);
  const [checkboxSelected, setCheckboxSelected] = useState(false);
  const [isApiCalling, setIsApiCalling] = useState(false);

  useEffect(() => {
    if (editData) {
      setCheckboxSelected(editData.allowNotifications);
    }
  }, [editData]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxSelected(event.target.checked);
  };

  const handleSubmit = useCallback(async () => {
    setIsApiCalling(true);
    const req = api.put(
      `/user/${editData.ident}`,
      { allowNotifications: checkboxSelected },
      {},
    );
    try {
      if (isSigned) {
        showConfirmDialog(req);
        setIsApiCalling(false);
      } else {
        await req.request();
        onClose({ ...editData, allowNotifications: checkboxSelected });
        snackbar.success('User Settings updated successfully.');
      }
    } catch (err) {
      showErrorSnackbar(`Error updating user settings: ${err.message}`);
      onClose();
    } finally {
      setIsApiCalling(false);
    }
  }, [checkboxSelected, editData, isSigned, showConfirmDialog, onClose, showErrorSnackbar]);

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>Edit User Settings</DialogTitle>
      <DialogContent>
        <div>
          <FormControlLabel
            label={`Allow email notifications to be sent to ${editData.email}`}
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

export default UserSettingsDialog;
