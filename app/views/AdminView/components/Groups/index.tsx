import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
} from '@material-ui/core';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditGroupDialog from './components/AddEditGroupDialog';
import { groupType } from '../../../../common';

import './index.scss';

const Groups = (): JSX.Element => {
  const [groups, setGroups] = useState<groupType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      const groupsResp = await api.get('/user/group', {}).request();

      setGroups(groupsResp);
      setLoading(false);
    };

    getData();
  }, []);

  return (
    <div className="admin-table__container">
      {!loading && (
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
      {loading && (
        <CircularProgress />
      )}
    </div>
  );
};

export default Groups;
