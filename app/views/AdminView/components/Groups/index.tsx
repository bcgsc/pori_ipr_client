import React, {
  useState, useEffect, useCallback,
} from 'react';
import {
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { GroupType } from '@/common';
import columnDefs from './columnDefs';
import AddEditGroupDialog from './components/AddEditGroupDialog';

import './index.scss';

const ALL_ACCESS = ['admin', 'manager', 'report manager', 'bioinformatician', 'read access', 'germline access', 'non-production access', 'unreviewed access', 'all projects access', 'template edit access', 'appendix edit access'];

const Groups = (): JSX.Element => {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<GroupType | null>();

  const snackbar = useSnackbar();

  useEffect(() => {
    const getData = async () => {
      let groupsResp = await api.get('/user/group').request();
      groupsResp = groupsResp.filter((group) => ALL_ACCESS.includes(group.name.toLowerCase()));
      groupsResp.sort((a, b) => ALL_ACCESS.indexOf(a.name.toLowerCase()) - ALL_ACCESS.indexOf(b.name.toLowerCase()));
      console.dir(groupsResp);
      setGroups(groupsResp);
      setLoading(false);
    };

    getData();
  }, []);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      const groupIndex = groups.findIndex((group) => group.ident === newData.ident);
      const newGroups = [...groups];
      newGroups[groupIndex] = newData;
      setGroups(newGroups);
      snackbar.enqueueSnackbar('Group edited');
    }
    setEditData(null);
  }, [groups, snackbar]);

  return (
    <div className="admin-table__container">
      {!loading && (
        <>
          <DataTable
            rowData={groups}
            columnDefs={columnDefs}
            isPaginated
            isFullLength
            canEdit
            onEdit={handleEditStart}
            titleText="Groups"
          />
          {showDialog && (
            <AddEditGroupDialog
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

export default Groups;
