import React, {
  useState, useEffect, useCallback, useContext,
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

import { SnackbarContext } from '@bcgsc/react-snackbar-provider';
import api from '../../../../../../services/api';
import DataTable from '../../../../../../components/DataTable';
import { projectType, shortReportType } from '../../../../types';
import { userType } from '../../../../../../common';
import { userColumnDefs, reportColumnDefs } from './columnDefs';
import ReportAutocomplete from '../../../../../../components/ReportAutocomplete';
import UserAutocomplete from '../../../../../../components/UserAutocomplete';

import './index.scss';

type AddEditProjectDialogType = {
  isOpen: boolean,
  onClose: (newData?: null | { name: string }) => void,
  editData: null | projectType,
};

const AddEditProjectDialog = ({
  isOpen,
  onClose,
  editData,
}: AddEditProjectDialogType): JSX.Element => {
  const [projectName, setProjectName] = useState<string>('');
  const [errors, setErrors] = useState<{ projectName: boolean }>({
    projectName: false,
  });
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [users, setUsers] = useState<userType[]>([]);
  const [reports, setReports] = useState<shortReportType[]>([]);

  const snackbar = useContext(SnackbarContext);

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

      onClose(createdResp);
    } else {
      setErrors({
        projectName: true,
      });
    }
  }, [projectName, editData, onClose]);

  const handleProjectDelete = async (ident) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Are you sure you want to remove this report from the ${projectName} project?`)) {
      await api.del(`/project/${editData.ident}/reports`, { report: ident }, {}).request();
      snackbar.add('Report removed from project');
    } else {
      snackbar.add('Report not removed');
    }
  };

  const handleUserDelete = async (ident) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Are you sure you want to remove this user from the ${projectName} project?`)) {
      await api.del(`/project/${editData.ident}/user`, { user: ident }, {}).request();
      snackbar.add('User removed from project');
    } else {
      snackbar.add('User not removed');
    }
  };

  const handleUserSubmit = useCallback(async (user) => {
    if (editData) {
      await api.post(`/project/${editData.ident}/user`, { user: user.ident }, {}).request();
      snackbar.add('User added to project');
    }
  }, [editData, snackbar]);

  const handleReportSubmit = useCallback(async (report) => {
    if (editData) {
      await api.post(`/project/${editData.ident}/reports`, { report: report.ident }, {}).request();
      snackbar.add('Report added to project');
    }
  }, [editData, snackbar]);

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
              onDelete={handleProjectDelete}
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
