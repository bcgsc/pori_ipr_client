import React, { useState, useEffect, useContext } from 'react';
import { CircularProgress } from '@material-ui/core';
import { SnackbarContext } from '@bcgsc/react-snackbar-provider';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditUserDialog from './components/AddEditUserDialog';
import { userType } from '../../../../common';

import './index.scss';

const Users = (): JSX.Element => {
  const [users, setUsers] = useState<userType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const snackbar = useContext(SnackbarContext);

  useEffect(() => {
    const getData = async () => {
      const usersResp = await api.get('/user', {}).request();

      setUsers(usersResp);
      setLoading(false);
    };

    getData();
  }, []);

  const handleDelete = async (ident) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to remove this user?')) {
      await api.del(`/user/${ident}`, {}, {}).request();
      snackbar.add('User deleted');
    } else {
      snackbar.add('User not deleted');
    }
  };

  return (
    <div className="admin-table__container">
      {!loading && (
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
          EditDialog={AddEditUserDialog}
          onDelete={handleDelete}
        />
      )}
      {loading && (
        <CircularProgress />
      )}
    </div>
  );
};

export default Users;
