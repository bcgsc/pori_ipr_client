import React, {
  useState, useEffect, useCallback,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Table,
  TableCell,
  TableRow,
  Typography,
  Switch,
} from '@mui/material';

import api from '@/services/api';
import AsyncButton from '@/components/AsyncButton';

import snackbar from '@/services/SnackbarUtils';
import { UserType } from '@/common';
import useSecurity from '@/hooks/useSecurity';

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
  const [checkboxSelected, setCheckboxSelected] = useState(false);
  const [isApiCalling, setIsApiCalling] = useState(false);
  const { userDetails } = useSecurity();

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
    try {
      const req = api.put(
        `/user/${editData.ident}/notifications`,
        { allowNotifications: checkboxSelected },
        {},
      );
      await req.request();
      onClose({ ...editData, allowNotifications: checkboxSelected });
      snackbar.success('User Settings updated successfully.');
    } catch (err) {
      showErrorSnackbar(`Error updating user settings: ${err.message}`);
      onClose();
    } finally {
      setIsApiCalling(false);
    }
  }, [checkboxSelected, editData, onClose, showErrorSnackbar]);

  const handleTestEmail = useCallback(async () => {
    setIsApiCalling(true);
    const req = api.get(
      '/email',
      {},
    );

    try {
      await req.request();
      snackbar.success('Test email sent successfully.');
    } catch (err) {
      showErrorSnackbar(`Error sending test email: ${err.message}`);
    } finally {
      setIsApiCalling(false);
    }
  }, [showErrorSnackbar]);

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle className="dialog-title">User Profile</DialogTitle>
      <DialogContent dividers>
        <Table size="medium">
          {userDetails && (
            <>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Username</Typography>
                </TableCell>
                <TableCell sx={{ paddingLeft: 1, width: '80%' }}>
                  {userDetails.username}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">First Name</Typography>
                </TableCell>
                <TableCell sx={{ paddingLeft: 1 }}>
                  {userDetails.firstName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Last Name</Typography>
                </TableCell>
                <TableCell sx={{ paddingLeft: 1 }}>
                  {userDetails.lastName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Email</Typography>
                </TableCell>
                <TableCell sx={{ paddingLeft: 1 }}>
                  {userDetails.email}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Projects</Typography>
                </TableCell>
                <TableCell sx={{ paddingLeft: 1 }}>
                  {userDetails.projects.map(({ name }, index, arr) => (
                    <React.Fragment key={`${name}-${arr.toString()}`}>
                      {name}
                      {(index < arr.length - 1 ? ', ' : '')}
                    </React.Fragment>
                  ))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Groups</Typography>
                </TableCell>
                <TableCell sx={{ paddingLeft: 1 }}>
                  {userDetails.groups.map(({ name }, index, arr) => (
                    <React.Fragment key={`${name}-${arr.toString()}`}>
                      {name}
                      {(index < arr.length - 1 ? ', ' : '')}
                    </React.Fragment>
                  ))}
                </TableCell>
              </TableRow>
            </>
          )}
        </Table>
        <div className="dialog-form">
          <FormControlLabel
            label={`Allow email notifications to ${editData.email}`}
            control={
              <Switch checked={checkboxSelected} onChange={handleCheckboxChange} />
            }
          />
        </div>
        <AsyncButton isLoading={isApiCalling} color="info" onClick={handleTestEmail} className="test-noti-button">
          <Typography variant="caption">Send me a test notification</Typography>
        </AsyncButton>
        <DialogActions className="edit-dialog__actions" disableSpacing>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <AsyncButton isLoading={isApiCalling} color="primary" onClick={handleSubmit}>
            Save
          </AsyncButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsDialog;
