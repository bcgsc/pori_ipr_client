import React, {
  useState, useEffect, useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { UserType } from '@/common';
import columnDefs from './columnDefs';
import AddEditUserDialog from './components/AddEditUserDialog';

import './index.scss';

const Users = (): JSX.Element => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<UserType>();

  const snackbar = useSnackbar();

  useEffect(() => {
    const getData = async () => {
      const usersResp = await api.get('/user').request();

      setUsers(usersResp);
      setLoading(false);
    };

    getData();
  }, []);

  const handleDelete = useCallback(async ({ ident }) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to remove this user?')) {
      await api.del(`/user/${ident}`, {}).request();
      const newUsers = users.filter((user) => user.ident !== ident);
      setUsers(newUsers);
      snackbar.enqueueSnackbar('User deleted');
    } else {
      snackbar.enqueueSnackbar('User not deleted');
    }
  }, [snackbar, users]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      const userIndex = users.findIndex((user) => user.ident === newData.ident);
      if (userIndex !== -1) {
        const newUsers = [...users];
        newUsers[userIndex] = newData;
        setUsers(newUsers);
      } else {
        setUsers((prevVal) => [...prevVal, newData]);
      }
    }
  }, [users]);

  return (
    <div className="admin-table__container">
      {!loading && (
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
      {loading && (
        <CircularProgress />
      )}
    </div>
  );
};

export default Users;
