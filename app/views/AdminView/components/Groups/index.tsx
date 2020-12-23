import React, { useState, useEffect } from 'react';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditGroupDialog from './components/AddEditGroupDialog';

import './index.scss';

const Groups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const groupsResp = await api.get('/user/group', {}).request();

      setGroups(groupsResp);
    };

    getData();
  }, []);

  return (
    <div className="admin-table__container">
      {Boolean(groups.length) && (
        <DataTable
          rowData={groups}
          columnDefs={columnDefs}
          isPaginated
          isFullLength
          canEdit
          canAdd
          EditDialog={AddEditGroupDialog}
          titleText="Groups"
        />
      )}
    </div>
  );
};

export default Groups;