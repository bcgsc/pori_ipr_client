import React, { useState, useEffect } from 'react';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddUserDialog from './components/AddUserDialog';

import './index.scss';

const Users = () => {
  const [users, setUsers] = useState([]);

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
          EditDialog={AddUserDialog}
        />
      )}
    </div>
  );
};

export default Users;
