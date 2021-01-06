import React, { useState, useEffect, useContext } from 'react';
import {
  CircularProgress,
} from '@material-ui/core';
import { SnackbarContext } from '@bcgsc/react-snackbar-provider';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditGroupDialog from './components/AddEditGroupDialog';
import { groupType } from '../../../../common';

import './index.scss';

const Groups = (): JSX.Element => {
  const [groups, setGroups] = useState<groupType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const snackbar = useContext(SnackbarContext);

  useEffect(() => {
    const getData = async () => {
      const groupsResp = await api.get('/user/group', {}).request();

      setGroups(groupsResp);
      setLoading(false);
    };

    getData();
  }, []);

  const handleDelete = async (ident) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to remove this group?')) {
      await api.del(`/user/group/${ident}`, {}, {}).request();
      snackbar.add('Group deleted');
    } else {
      snackbar.add('Group not deleted');
    }
  };

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
          canDelete
          onDelete={handleDelete}
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
