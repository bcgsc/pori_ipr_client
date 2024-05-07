import React, {
  useState, useEffect, useCallback, useReducer,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [users, setUsers] = useState<UserGroupMemberType[]>([]);
  const [apiCallQueue, apiCallQueueDispatch] = useReducer(reducer, []);

  useEffect(() => {
    const {
      users: editUsers,
    } = editData;

    setDialogTitle(`Edit ${editData.name} group members`);
    setUsers(editUsers);
  }, [editData]);

  const handleDeleteUser = useCallback(({ ident }) => {
    apiCallQueueDispatch({ type: 'add', payload: api.del(`/user/group/${editData.ident}/member`, { user: ident }, {}) });
    const newUsers = users.filter((user) => user.ident !== ident);
    setUsers(newUsers);
  }, [editData, users]);

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
    </Dialog>
  );
};

export default AddEditUserDialog;
