import React, { useState, useEffect, useContext } from 'react';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';

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
    <React.Fragment>
      {Boolean(users.length) && (
        <DataTable
          rowData={users}
          columnDefs={columnDefs}
          isFullLength
        />
      )}
    </React.Fragment>
  );
};

export default Users;
