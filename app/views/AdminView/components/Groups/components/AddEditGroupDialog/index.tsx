import React, {
  useState, useEffect, useCallback,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { GroupType, UserGroupMemberType } from '@/common';
import snackbar from '@/services/SnackbarUtils';
import UserAutocomplete from '@/components/UserAutocomplete';
import columnDefs from './columnDefs';

import './index.scss';

type AddEditGroupDialogProps = {
  isOpen: boolean;
  onClose: (newData?: null | { name: string }) => void;
  editData: null | GroupType;
};

const AddEditUserDialog = ({
  isOpen,
  onClose,
  editData,
}: AddEditGroupDialogProps): JSX.Element => {
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [users, setUsers] = useState<UserGroupMemberType[]>([]);

  useEffect(() => {
    const {
      users: editUsers,
    } = editData;

    setDialogTitle(`Edit ${editData.name} group members`);
    setUsers(editUsers);
  }, [editData]);

  const handleDeleteUser = useCallback(async (user) => {
    try {
      await api.del(`/user/group/${editData.ident}/member`, { user: user.ident }).request();
      const newUsers = users.filter((userFilter) => userFilter.ident !== user.ident);
      setUsers(newUsers);
      snackbar.success(`Successfully removed user ${user.firstName} ${user.lastName}`);
    } catch {
      snackbar.error(`Error removing user ${user.firstName} ${user.lastName}`);
    }
  }, [editData, users]);

  const handleAddUser = useCallback(async (user) => {
    try {
      await api.post(`/user/group/${editData.ident}/member`, { user: user.ident }).request();
      setUsers((prevVal) => [...prevVal, user]);
      snackbar.success(`Successfully added user ${user.firstName} ${user.lastName}`);
    } catch {
      snackbar.error(`Error adding user ${user.firstName} ${user.lastName}`);
    }
  }, [editData]);

  return (
    <Dialog open={isOpen} onClose={() => onClose(null)} maxWidth="sm" fullWidth className="edit-dialog">
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
