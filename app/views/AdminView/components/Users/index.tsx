import React, {
  useState, useCallback,
} from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { CircularProgress } from '@mui/material';

import snackbar from '@/services/SnackbarUtils';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { UserType } from '@/common';
import snackbar from '@/services/SnackbarUtils';
import { ErrorMixin } from '@/services/errors/errors';
import columnDefs from './columnDefs';
import AddEditUserDialog from './components/AddEditUserDialog';
import './index.scss';

const fetchUsers = async () => {
  const usersResp = await api.get('/user').request();
  return usersResp;
};

const deleteUser = async (ident: UserType['ident']) => {
  await api.del(`/user/${ident}`, {}).request();
};

const Users = (): JSX.Element => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<UserType>();

  const { data: users, isLoading } = useQuery<UserType[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    onError: (err) => snackbar.error(`Failed to retrive users ${err}`),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (ident) => await api.del(`/user/${ident}`, {}).request(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      snackbar.success('User deleted');
    },
    onError: (error: ErrorMixin) => {
      snackbar.error(`Error deleting user: ${error.message}`);
    },
  });

  const handleDelete = useCallback((rowData) => {
    if (rowData.ident) {
      // TODO: Add an actual dialog whenever time allows
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Are you sure you want to remove this user (${rowData.username})?`)) {
        deleteUserMutation.mutate(rowData.ident);
      } else {
        snackbar.info('User not deleted');
      }
    }
  }, [deleteUserMutation]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  }, [queryClient]);

  return (
    <div className="admin-table__container">
      {!isLoading && (
        <>
          <DataTable
            rowData={users}
            columnDefs={columnDefs}
            isPaginated
            isFullLength
            canEdit
            canAdd
            addText="Add user"
            canDelete
            titleText="Users"
            onDelete={handleDelete}
            onEdit={handleEditStart}
            onAdd={() => {
              setEditData(null);
              setShowDialog(true);
            }}
          />
          {showDialog && (
            <AddEditUserDialog
              isOpen={showDialog}
              onClose={handleEditClose}
              editData={editData}
            />
          )}
        </>
      )}
      {isLoading && (
        <CircularProgress />
      )}
    </div>
  );
};

export default Users;
