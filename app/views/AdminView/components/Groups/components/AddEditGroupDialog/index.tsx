import React, {
  useState, useEffect, useCallback, useReducer,
} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
} from '@mui/material';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { GroupType, UserGroupMemberType, UserType } from '@/common';
import UserAutocomplete from '@/components/UserAutocomplete';
import columnDefs from './columnDefs';

import './index.scss';

type AddEditGroupDialogProps = {
  isOpen: boolean;
  onClose: (newData?: null | { name: string }) => void;
  editData: null | GroupType;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'add':
      return [...state, action.payload];
    case 'reset':
      return [];
    default:
      return state;
  }
};

const AddEditUserDialog = ({
  isOpen,
  onClose,
  editData,
}: AddEditGroupDialogProps): JSX.Element => {
  const [groupName, setGroupName] = useState<string>('');
  const [errors, setErrors] = useState({
    groupName: false,
  });
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [users, setUsers] = useState<UserGroupMemberType[]>([]);
  const [owner, setOwner] = useState<UserType>();
  const [apiCallQueue, apiCallQueueDispatch] = useReducer(reducer, []);

  useEffect(() => {
    console.dir(editData);
    console.dir(groupName);
    if (editData) {
      const {
        name: editName,
        users: editUsers,
        owner: editOwner,
      } = editData;

      setDialogTitle(`Edit ${editData.name} group members`);
      setGroupName(editName);
      setUsers(editUsers);
      setOwner(editOwner);
    } else {
      setDialogTitle('Add group');
      setGroupName('');
      setUsers([]);
      setOwner(null);
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

      await Promise.all(apiCallQueue.map((call) => call.request()));
      const updatedGroup = await api.get(`/user/group/${createdResp.ident}`, {}).request();

      onClose(updatedGroup);
    } else {
      setErrors({
        groupName: true,
      });
    }
  }, [groupName, owner, editData, apiCallQueue, onClose]);

  const handleDeleteUser = useCallback(({ ident }) => {
    apiCallQueueDispatch({ type: 'add', payload: api.del(`/user/group/${editData.ident}/member`, { user: ident }, {}) });
    const newUsers = users.filter((user) => user.ident !== ident);
    setUsers(newUsers);
  }, [editData, users]);

  const handleOwnerChange = (userSelected) => {
    if (userSelected) {
      setOwner(userSelected);
    }
  };

  const handleAddUser = useCallback(async (user) => {
    apiCallQueueDispatch({ type: 'add', payload: api.post(`/user/group/${editData.ident}/member`, { user: user.ident }, {}) });
    setUsers((prevVal) => [...prevVal, user]);
  }, [editData]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        {editData && (
          <>
            <UserAutocomplete
              onSubmit={handleAddUser}
              label="Add user to group"
            />
            <DataTable
              rowData={users}
              columnDefs={columnDefs}
              canViewDetails={false}
              onDelete={handleDeleteUser}
              canDelete
            />
          </>
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
