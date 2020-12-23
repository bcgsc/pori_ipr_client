import React, { useState, useEffect } from 'react';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditUserDialog from './components/AddEditUserDialog';
import { userType } from '../../types';

import './index.scss';

const Users = (): JSX.Element => {
  const [users, setUsers] = useState<userType[]>([]);

  useEffect(() => {
    const getData = async () => {
      const usersResp = await api.get('/user', {}).request();

      setUsers(usersResp);
    };

    getData();
  }, []);

  return (
    <div className="admin-table__container">
      {Boolean(users.length) && (
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
    </div>
  );
};

export default Users;
