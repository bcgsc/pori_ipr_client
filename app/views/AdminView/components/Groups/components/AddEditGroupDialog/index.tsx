import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
} from '@material-ui/core';

import { SnackbarContext } from '@bcgsc/react-snackbar-provider';
import api from '../../../../../../services/api';
import DataTable from '../../../../../../components/DataTable';
import { groupType, userGroupMemberType, userType } from '../../../../../../common';
import columnDefs from './columnDefs';
import UserAutocomplete from '../../../../../../components/UserAutocomplete';

import './index.scss';

type AddEditGroupDialogType = {
  isOpen: boolean,
  onClose: (newData?: null | { name: string }) => void,
  editData: null | groupType,
};

const AddEditUserDialog = ({
  isOpen,
  onClose,
  editData,
}: AddEditGroupDialogType): JSX.Element => {
  const [groupName, setGroupName] = useState<string>('');
  const [errors, setErrors] = useState({
    groupName: false,
  });
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [users, setUsers] = useState<userGroupMemberType[]>();
  const [owner, setOwner] = useState<userType>();

  const snackbar = useContext(SnackbarContext);

  useEffect(() => {
    if (editData) {
      const {
        name: editName,
        users: editUsers,
        owner: editOwner,
      } = editData;

      setDialogTitle('Edit group');
      setGroupName(editName);
      setUsers(editUsers);
      setOwner(editOwner);
    } else {
      setDialogTitle('Add group');
      setGroupName('');
      setUsers([]);
    }
  }, [editData]);

  const handleClose = useCallback(async () => {
    if (groupName.length && owner) {
      const newEntry = {
        name: groupName,
        owner: owner.ident,
      };

      let createdResp;
      if (editData) {
        createdResp = await api.put(`/user/group/${editData.ident}`, newEntry, {}).request();
      } else {
        createdResp = await api.post('/user/group', newEntry, {}).request();
      }

      onClose(createdResp);
    } else {
      setErrors({
        groupName: true,
      });
    }
  }, [groupName, editData, onClose, owner]);

  const handleDelete = async (ident) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Are you sure you want to remove this user from the ${groupName} group?`)) {
      await api.del(`/user/group/${editData.ident}/member`, { user: ident }, {}).request();
      snackbar.add('User removed');
    } else {
      snackbar.add('User not removed');
    }
  };

  const handleOwnerChange = (userSelected) => {
    if (userSelected) {
      setOwner(userSelected);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth classes={{ root: 'add-user__form-container' }} variant="outlined">
          <TextField
            value={groupName}
            fullWidth
            onChange={({ target: { value } }) => setGroupName(value)}
            label="Group Name"
            variant="outlined"
            error={errors.groupName}
            helperText={errors.groupName ? 'Group name is required' : null}
            className="add-user__text-field"
            required
          />
        </FormControl>
        <UserAutocomplete
          defaultValue={editData ? editData.owner : null}
          onChange={handleOwnerChange}
          label="Group owner"
        />
        {editData && (
          <DataTable
            rowData={users}
            columnDefs={columnDefs}
            canViewDetails={false}
            onDelete={handleDelete}
            canDelete
          />
        )}
      </DialogContent>
      <DialogActions className="edit-dialog__actions">
        <Button color="primary" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleClose}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditUserDialog;
