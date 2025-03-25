// TODO fix api permissions/error text for adding users to project
import React, {
  useState, useEffect, useCallback,
} from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  Typography,
} from '@mui/material';

import { useQuery, useQueryClient, useMutation } from 'react-query';
import api, { ApiCall } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import { UserType } from '@/common';
import ReportAutocomplete from '@/components/ReportAutocomplete';
import UserAutocomplete from '@/components/UserAutocomplete';
import useResource from '@/hooks/useResource';
import AsyncButton from '@/components/AsyncButton';
import { ProjectType, ShortReportType } from '../../../AdminView/types';
import { userColumnDefs, reportColumnDefs } from './columnDefs';
import './index.scss';

type AddEditProjectDialogProps = {
  isOpen: boolean;
  onClose: (newData: null | ProjectType[], isNew?: boolean) => void;
  editData: null | ProjectType;
};

function getIdentDiff(originalArray, updatedArray) {
  const addedObjects = updatedArray.filter((updatedObj) => !originalArray.find((originalObj) => originalObj.ident === updatedObj.ident));
  const removedObjects = originalArray.filter((originalObj) => !updatedArray.find((updatedObj) => updatedObj.ident === originalObj.ident));

  return {
    added: addedObjects,
    removed: removedObjects,
  };
}

const AddEditProjectDialog = ({
  isOpen,
  onClose,
  editData,
}: AddEditProjectDialogProps): JSX.Element => {
  const [projectName, setProjectName] = useState<string>('');
  const [projectDesc, setProjectDesc] = useState<string>('');
  const [errors, setErrors] = useState<{ projectName: boolean }>({
    projectName: false,
  });
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [reports, setReports] = useState<ShortReportType[]>([]);
  const [existingReports, setExistingReports] = useState<ShortReportType[]>([]);
  const { adminAccess, managerAccess } = useResource();
  const queryClient = useQueryClient();

  const { isLoading: isReportsLoading, refetch } = useQuery<ShortReportType[]>({
    queryKey: ['projectReports', editData?.ident],
    queryFn: async () => {
      if (editData?.ident) {
        const resp = await api.get(`/project/${editData.ident}/reports`).request();
        return resp;
      }
      return [];
    },
    enabled: Boolean(isOpen && editData?.ident),
    onSuccess: (data) => {
      setExistingReports(data);
      setReports(data);
    },
    onError: () => snackbar.error('Error: failed to get reports'),
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, onClose, refetch]);

  // Populate initial data, if any
  useEffect(() => {
    if (editData) {
      const {
        name: editName,
        users: editUsers,
        description: editDesc,
      } = editData;

      setDialogTitle('Edit project');
      setProjectName(editName ?? '');
      setProjectDesc(editDesc ?? '');
      setUsers(editUsers);
    } else {
      setDialogTitle('Add project');
      setProjectName('');
      setProjectDesc('');
      setUsers([]);
    }
  }, [editData]);

  const projectMutation = useMutation(
    async (newEntry: { name: string; description: string }) => {
      // Update project specific fields
      if (editData) {
        return api.put(`/project/${editData.ident}`, newEntry).request();
      }
      return api.post('/project', newEntry).request();
    },
    {
      onSuccess: async (projectUpdateResp) => {
        // Handle relationships to projects
        const { added: usersToAdd, removed: usersToRemove } = getIdentDiff(editData?.users ?? [], users);
        const { added: reportsToAdd, removed: reportsToRemove } = getIdentDiff(existingReports ?? [], reports);

        const apiCallQueue = [];
        usersToAdd.forEach((u) => apiCallQueue.push(api.post(`/project/${projectUpdateResp.ident}/user`, { user: u.ident })));
        usersToRemove.forEach((u) => apiCallQueue.push(api.del(`/project/${projectUpdateResp.ident}/user`, { user: u.ident })));
        reportsToAdd.forEach((r) => apiCallQueue.push(api.post(`/project/${projectUpdateResp.ident}/reports`, { report: r.ident })));
        reportsToRemove.forEach((r) => apiCallQueue.push(api.del(`/project/${projectUpdateResp.ident}/reports`, { report: r.ident })));

        await Promise.all(apiCallQueue.map((call) => call.request()));

        // Return the updated projects
        const updatedProjects = await api.get(`/project?admin=${adminAccess}`).request();
        onClose(updatedProjects, Boolean(!editData));
        queryClient.invalidateQueries(['projectReports']);
      },
      onError: (error: Error) => {
        snackbar.error(`Error ${editData ? 'editing' : 'creating'} project, ${error?.message}`);
      },
    },
  );

  const handleClose = useCallback(() => {
    if (projectName.length) {
      const newEntry = {
        name: projectName,
        description: projectDesc,
      };

      projectMutation.mutate(newEntry);
    } else {
      setErrors({
        projectName: true,
      });
    }
  }, [projectName, projectDesc, projectMutation]);

  const handleReportDelete = useCallback(({ ident }) => {
    setReports((oldReports) => oldReports.filter((entry) => entry.ident !== ident));
  }, []);

  const handleUserDelete = useCallback(({ ident }) => {
    setUsers((oldUsers) => oldUsers.filter((entry) => entry.ident !== ident));
  }, []);

  const handleUserAdd = useCallback((user) => {
    setUsers((prevVal) => {
      if (!prevVal.find(({ ident }) => user.ident === ident)) {
        return [...prevVal, user];
      }
      return prevVal;
    });
  }, []);

  const handleReportAdd = useCallback((report) => {
    setReports((prevVal) => {
      if (!prevVal.find(({ ident }) => report.ident === ident)) {
        return [...prevVal, report];
      }
      return prevVal;
    });
  }, []);

  return (
    <Dialog open={isOpen} onClose={() => onClose(null)} maxWidth="sm" fullWidth className="edit-dialog">
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
            disabled={!adminAccess}
            required
          />
        </FormControl>
        <FormControl fullWidth classes={{ root: 'add-user__form-container' }} variant="outlined">
          <TextField
            value={projectDesc || 'no project description'}
            fullWidth
            onChange={({ target: { value } }) => setProjectDesc(value)}
            label="Project Description"
            variant="outlined"
            className="add-user__text-field"
            disabled={!managerAccess}
          />
        </FormControl>

        <Typography className="edit-dialog__section-title" variant="h3">
          Users
        </Typography>
        <UserAutocomplete
          onSubmit={handleUserAdd}
          label="Add User"
        />
        <DataTable
          rowData={users}
          columnDefs={userColumnDefs}
          canViewDetails={false}
          onDelete={handleUserDelete}
          canDelete
        />
        <Typography className="edit-dialog__section-title" variant="h3">
          Reports
        </Typography>
        {adminAccess && (
        <ReportAutocomplete
          onSubmit={handleReportAdd}
          label="Add Report"
        />
        )}
        {isReportsLoading
          ? <CircularProgress />
          : (
            <DataTable
              rowData={reports}
              columnDefs={reportColumnDefs}
              canViewDetails={false}
              onDelete={handleReportDelete}
              canDelete
            />
          )}
      </DialogContent>
      <DialogActions className="edit-dialog__actions">
        <Button color="primary" onClick={() => onClose(null, false)}>
          Cancel
        </Button>
        <AsyncButton
          color="primary"
          disabled={isReportsLoading || projectMutation.isLoading}
          onClick={handleClose}
          isLoading={projectMutation.isLoading}
        >
          Save
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditProjectDialog;
