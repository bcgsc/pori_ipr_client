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

import useResource from '@/hooks/useResource';
import './index.scss';

const ALL_ACCESS = ['admin', 'manager', 'create report access', 'report assignment access', 'germline access', 'non-production access', 'unreviewed access', 'all projects access', 'template edit access', 'appendix edit access', 'variant-text edit access'];

const Groups = (): JSX.Element => {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<GroupType | null>();
  const { adminAccess, allProjectsAccess } = useResource();
  const snackbar = useSnackbar();

  useEffect(() => {
    const getData = async () => {
      let groupsResp = await api.get('/user/group').request();
      groupsResp = groupsResp.filter((group) => ALL_ACCESS.includes(group.name.toLowerCase()));
      groupsResp.sort((a, b) => ALL_ACCESS.indexOf(a.name.toLowerCase()) - ALL_ACCESS.indexOf(b.name.toLowerCase()));
      setGroups(groupsResp);
      setLoading(false);
    };

    getData();
  }, []);

  const handleEditStart = (rowData) => {
    if (rowData.name === 'admin' && !adminAccess) {
      snackbar.enqueueSnackbar('You do not have permission to edit this group');
    }
    else if (rowData.name === 'all projects access' && !(adminAccess || allProjectsAccess)) {
      snackbar.enqueueSnackbar('You do not have permission to edit this group');
    }
    else {
      setShowDialog(true);
      setEditData(rowData);
    }
  };

  const checkGroupEditPermissions = (rowData) => {
    if (rowData.name === 'admin' && !adminAccess) {
      return false;
    } else if (rowData.name === 'all projects access' && !(adminAccess || allProjectsAccess)) {
      return false;
    }
    return true;
  };

  const handleEditClose = useCallback(async (newData) => {
    setShowDialog(false);
    if (newData) {
      const groupIndex = groups.findIndex((group) => group.ident === newData.ident);
      const newGroups = [...groups];
      newGroups[groupIndex] = newData;
      setGroups(newGroups);
      snackbar.enqueueSnackbar('Group edited');
      let groupsResp = await api.get('/user/group').request();
      groupsResp = groupsResp.filter((group) => ALL_ACCESS.includes(group.name.toLowerCase()));
      groupsResp.sort((a, b) => ALL_ACCESS.indexOf(a.name.toLowerCase()) - ALL_ACCESS.indexOf(b.name.toLowerCase()));
      setGroups(groupsResp);
      setLoading(false);
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
            canEdit={checkGroupEditPermissions}
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
