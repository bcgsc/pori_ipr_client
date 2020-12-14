import React, { useState, useEffect, useContext } from 'react';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';

import './index.scss';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const call = api.get('/user', {});
      const usersResp = await call.request();

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
        />
      )}
    </div>
  );
};

export default Users;
