import React, {
  useState, useEffect, useCallback, useReducer,
} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
} from '@material-ui/core';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { UserType } from '@/common';
import ReportAutocomplete from '@/components/ReportAutocomplete';
import UserAutocomplete from '@/components/UserAutocomplete';
import { ProjectType, ShortReportType } from '../../../../types';
import { userColumnDefs, reportColumnDefs } from './columnDefs';

import './index.scss';

type AddEditProjectDialogProps = {
  isOpen: boolean;
  onClose: (newData?: null | { name: string }) => void;
  editData: null | ProjectType;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'add':
      return [...state, action.payload];
    case 'reset':
      return [];
    default:
      return state;
  }
};

const AddEditProjectDialog = ({
  isOpen,
  onClose,
  editData,
}: AddEditProjectDialogProps): JSX.Element => {
  const [projectName, setProjectName] = useState<string>('');
  const [errors, setErrors] = useState<{ projectName: boolean }>({
    projectName: false,
  });
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [reports, setReports] = useState<ShortReportType[]>([]);
  const [apiCallQueue, apiCallQueueDispatch] = useReducer(reducer, []);

  useEffect(() => {
    if (editData) {
      const {
        name: editName,
        users: editUsers,
        reports: editReports,
      } = editData;

      setDialogTitle('Edit project');
      setProjectName(editName);
      setUsers(editUsers);
      setReports(editReports);
    } else {
      setDialogTitle('Add project');
      setProjectName('');
      setUsers([]);
      setReports([]);
    }
  }, [editData]);

  const handleClose = useCallback(async () => {
    if (projectName.length) {
      const newEntry = {
        name: projectName,
      };

      let createdResp;
      if (editData) {
        createdResp = await api.put(`/project/${editData.ident}`, newEntry, {}).request();
      } else {
        createdResp = await api.post('/project', newEntry, {}).request();
      }

      await Promise.all(apiCallQueue.map((call) => call.request()));
      const updatedProject = await api.get(`/project/${createdResp.ident}`, {}).request();

      onClose(updatedProject);
    } else {
      setErrors({
        projectName: true,
      });
    }
  }, [projectName, editData, apiCallQueue, onClose]);

  const handleReportDelete = useCallback((ident) => {
    apiCallQueueDispatch({ type: 'add', payload: api.del(`/project/${editData.ident}/reports`, { report: ident }, {}) });
    const newReports = reports.filter((entry) => entry.ident !== ident);
    setReports(newReports);
  }, [editData, reports]);

  const handleUserDelete = useCallback((ident) => {
    apiCallQueueDispatch({ type: 'add', payload: api.del(`/project/${editData.ident}/user`, { user: ident }, {}) });
    const newUsers = users.filter((user) => user.ident !== ident);
    setUsers(newUsers);
  }, [editData, users]);

  const handleUserSubmit = useCallback((user) => {
    apiCallQueueDispatch({ type: 'add', payload: api.post(`/project/${editData.ident}/user`, { user: user.ident }, {}) });
    setUsers((prevVal) => [...prevVal, user]);
  }, [editData]);

  const handleReportSubmit = useCallback((report) => {
    apiCallQueueDispatch({ type: 'add', payload: api.post(`/project/${editData.ident}/reports`, { report: report.ident }, {}) });
    setReports((prevVal) => [...prevVal, report]);
  }, [editData]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth classes={{ root: 'add-user__form-container' }} variant="outlined">
          <TextField
            value={projectName}
            fullWidth
            onChange={({ target: { value } }) => setProjectName(value)}
            label="Project Name"
            variant="outlined"
            error={errors.projectName}
            helperText={errors.projectName ? 'Project name is required' : null}
            className="add-user__text-field"
            required
          />
        </FormControl>
        {editData && (
          <>
            <UserAutocomplete
              onSubmit={handleUserSubmit}
              label="Add User"
            />
            <DataTable
              rowData={users}
              columnDefs={userColumnDefs}
              canViewDetails={false}
              onDelete={handleUserDelete}
              canDelete
            />
            <ReportAutocomplete
              onSubmit={handleReportSubmit}
              label="Add Report"
            />
            <DataTable
              rowData={reports}
              columnDefs={reportColumnDefs}
              canViewDetails={false}
              onDelete={handleReportDelete}
              canDelete
            />
          </>
        )}
      </DialogContent>
      <DialogActions className="edit-dialog__actions">
        <Button color="primary" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleClose}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditProjectDialog;
