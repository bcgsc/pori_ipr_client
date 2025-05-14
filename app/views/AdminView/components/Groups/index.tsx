import React, {
  useState, useEffect, useCallback,
  useMemo,
} from 'react';
import {
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { GroupType } from '@/common';
import { basicTooltipValueGetter } from '@/components/DataTable/components/ToolTip';
import useResource from '@/hooks/useResource';
import AddEditGroupDialog from './components/AddEditGroupDialog';

import './index.scss';

const descriptions = {
  admin: 'all access',
  'all projects access': 'access to all projects',
  'template edit access': 'can create/edit/delete report templates',
  'appendix edit access': 'can create/edit/delete template appendix text',
  'unreviewed access': 'can view reports that have not been reviewed',
  'non-production access': 'can view reports that have non-production status',
  'germline access': 'can view germline reports',
  'report assignment access': 'can assign users to reports; bioinformatician',
  'create report access': 'can load new reports',
  'variant-text edit access': 'can create/edit/delete specific variant-text',
  manager: 'can create/edit/delete nonadmin users; all other permissions within assigned projects',
};

const ALL_ACCESS = [
  'admin',
  'manager',
  'report assignment access',
  'create report access',
  'germline access',
  'non-production access',
  'unreviewed access',
  'all projects access',
  'template edit access',
  'appendix edit access',
  'variant-text edit access',
];

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

  const groupColumnDefs = useMemo(() => ([
    {
      headerName: 'Group Name',
      valueGetter: ({ data }) => data.name.toLowerCase(),
      hide: false,
    },
    {
      headerName: 'Description',
      valueGetter: ({ data }) => {
        if (data.description) {
          return data.description;
        }
        if (descriptions[data.name.toLowerCase()]) {
          return descriptions[data.name.toLowerCase()];
        }
        return '';
      },
      tooltipComponent: 'ToolTip',
      tooltipValueGetter: basicTooltipValueGetter,
      hide: false,
      flex: 1,
      autoHeight: true,
      wrapText: true,
    },
    {
      headerName: 'Actions',
      cellRenderer: 'ActionCellRenderer',
      cellRendererParams: ({ data: { name } }) => {
        let nextCanEdit = true;
        if (name === 'admin' && !adminAccess) {
          nextCanEdit = false;
        }
        if (name === 'all projects access' && !(adminAccess || allProjectsAccess)) {
          nextCanEdit = false;
        }
        return ({
          canEditRowData: nextCanEdit,
        });
      },
      pinned: 'right',
      sortable: false,
      suppressMenu: true,
    },
  ]), [adminAccess, allProjectsAccess]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
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
            columnDefs={groupColumnDefs}
            isPaginated
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
