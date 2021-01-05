import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditUserDialog from './components/AddEditUserDialog';
import { userType } from '../../../../common';

import './index.scss';

const Users = (): JSX.Element => {
  const [users, setUsers] = useState<userType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      const usersResp = await api.get('/user', {}).request();

      setUsers(usersResp);
      setLoading(false);
    };

    getData();
  }, []);

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
          titleText="Users"
          EditDialog={AddEditUserDialog}
        />
      )}
      {loading && (
        <CircularProgress />
      )}
    </div>
  );
};

export default Users;
