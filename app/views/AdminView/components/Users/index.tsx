import React, {
  useState, useEffect, useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import snackbar from '@/services/SnackbarUtils';
import { useQuery, useQueryClient, useMutation, QueryClient } from 'react-query';


import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { UserType } from '@/common';
import columnDefs from './columnDefs';
import AddEditUserDialog from './components/AddEditUserDialog';

import './index.scss';

const Users = (): JSX.Element => {
  // const [users, setUsers] = useState<UserType[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<UserType>();
  const queryClient = useQueryClient()
  // const snackbar = useSnackbar();

  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['users'],
    queryFn: async () => await api.get('/user').request(),
    onError: (err) => snackbar.error(`Failed to retrive users ${err}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (ident) => await api.del(`/user/${ident}`, {}).request(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      snackbar.success('User deleted');
    },
    onError: (err) => snackbar.error(`Failed to delete user ${err}`),
  });

  // useEffect(() => {
  //   const getData = async () => {
  //     const usersResp = await api.get('/user').request();

  //     setUsers(usersResp);
  //     setLoading(false);
  //   };

  //   getData();
  // }, []);

  const handleDelete = useCallback(async ({ ident }) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to remove this user?')) {
      deleteMutation.mutate(ident);
    }
  }, [deleteMutation]);

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
