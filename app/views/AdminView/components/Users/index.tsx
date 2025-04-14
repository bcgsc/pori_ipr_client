import React, {
  useState, useCallback,
} from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { UserType } from '@/common';
import columnDefs from './columnDefs';
import AddEditUserDialog from './components/AddEditUserDialog';

import './index.scss';

const Users = (): JSX.Element => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<UserType>();
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  const fetchUsers = async () => {
    const resp = await api.get('/user').request();
    return resp;
  };

  const deleteUser = async (ident: string) => {
    const resp = await api.del(`/user/${ident}`, {}).request();
    return resp;
  };

  const { data: users, isLoading } = useQuery<UserType[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.refetchQueries(['users']);
      snackbar.enqueueSnackbar('User deleted');
    },
    onError: () => {
      snackbar.enqueueSnackbar('User not deleted');
    },
  });

  const handleDelete = useCallback(async ({ ident }) => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (confirm('Are you sure you want to remove this user?')) {
      deleteMutation.mutate(ident);
    } else {
      snackbar.enqueueSnackbar('User not deleted');
    }
  }, [deleteMutation, snackbar]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      queryClient.invalidateQueries(['users']);
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
