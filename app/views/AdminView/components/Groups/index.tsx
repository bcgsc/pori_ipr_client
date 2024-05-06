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

const ALL_ACCESS = ['admin', 'manager', 'report manager', 'bioinformatician', 'readonly', 'germline access', 'non-production access', 'unreviewed access']

const Groups = (): JSX.Element => {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<GroupType | null>();

  const snackbar = useSnackbar();

  useEffect(() => {
    const getData = async () => {
      let groupsResp = await api.get('/user/group').request();
      console.log('in groups 28');
      groupsResp = groupsResp.filter((group) => ALL_ACCESS.includes(group.name.toLowerCase()));
      groupsResp.sort((a, b) => ALL_ACCESS.indexOf(a.name.toLowerCase()) - ALL_ACCESS.indexOf(b.name.toLowerCase()));
      console.dir(groupsResp);
      setGroups(groupsResp);
      setLoading(false);
    };

    getData();
  }, []);

  const handleDelete = useCallback(async ({ ident }) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to remove this group?')) {
      await api.del(`/user/group/${ident}`, {}).request();
      const newGroups = groups.filter((group) => group.ident !== ident);
      setGroups(newGroups);
      snackbar.enqueueSnackbar('Group deleted');
    } else {
      snackbar.enqueueSnackbar('Group not deleted');
    }
  }, [snackbar, groups]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      const groupIndex = groups.findIndex((group) => group.ident === newData.ident);
      if (groupIndex !== -1) {
        const newGroups = [...groups];
        newGroups[groupIndex] = newData;
        setGroups(newGroups);
        snackbar.enqueueSnackbar('Group edited');
      } else {
        setGroups((prevVal) => [...prevVal, newData]);
        snackbar.enqueueSnackbar('Group added');
      }
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
            canAdd
            onAdd={() => setShowDialog(true)}
            addText="Add group"
            canDelete
            onDelete={handleDelete}
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
