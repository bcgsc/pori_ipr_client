// TODO fix api permissions/error text for adding users to project
import React, {
  useState, useEffect, useCallback,
  useMemo,
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
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
} from '@mui/material';

import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '@/services/api';
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

const fetchReports = async (editData): Promise<ShortReportType[]> => {
  if (editData?.ident) {
    const resp = await api.get(`/project/${editData.ident}/reports`).request();
    return resp;
  }
  return [];
};

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
  const [projectUsersToAdd, setProjectUsersToAdd] = useState<ProjectType | null>(null);
  const { adminAccess, managerAccess } = useResource();
  const queryClient = useQueryClient();

  const { isLoading: isReportsLoading } = useQuery<ShortReportType[]>({
    queryKey: ['projectReports', editData?.ident],
    queryFn: () => fetchReports(editData),
    enabled: Boolean(isOpen && editData?.ident),
    refetchOnMount: true,
    staleTime: 0,
    onSuccess: (data) => {
      setExistingReports(data);
      setReports(data);
    },
    onError: () => snackbar.error('Error: failed to get reports'),
  });

  const projects: ProjectType[] = queryClient.getQueryData(['projects', adminAccess]);

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

  const { isLoading: isSaving, mutate: projectMutation } = useMutation(
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

      projectMutation(newEntry);
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

  const handleAddAllUsersToProject = useCallback((evt) => {
    setProjectUsersToAdd(evt.target.value);
  }, []);

  const handleConfirmAddAllusersToProject = useCallback(() => {
    setUsers((prevVal) => {
      const existing = new Set();
      prevVal.forEach((p) => existing.add(p.ident));
      const toAdd = projectUsersToAdd?.users.filter(({ ident }) => !existing.has(ident));
      return [...prevVal, ...toAdd];
    });
    setProjectUsersToAdd(null);
  }, [projectUsersToAdd]);

  const projectSelectOptions = useMemo(() => projects.filter((p) => p.ident !== editData?.ident).map((project) => (
    // @ts-expect-error: using object as value is intentional
    <MenuItem key={project.ident} value={project}>
      {project.name}
    </MenuItem>
  )), [editData?.ident, projects]);

  return (
    <>
      <Dialog open={Boolean(projectUsersToAdd)} maxWidth="lg" fullWidth className="edit-dialog">
        <DialogTitle>{`Add all users from ${projectUsersToAdd?.name} to ${projectName || 'new project'}?`}</DialogTitle>
        <DialogContent>
          {`The following users will be added to ${projectName}`}
          <List>
            {
              projectUsersToAdd?.users.map((u) => {
                if (!users?.map(({ ident }) => ident).includes(u.ident)) {
                  return <ListItem key={u.ident}>{`${u.username} (${u.firstName} ${u.lastName})`}</ListItem>;
                }
                return null;
              })
            }
          </List>
        </DialogContent>
        <DialogActions className="edit-dialog__actions">
          <Button color="primary" onClick={() => setProjectUsersToAdd(null)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmAddAllusersToProject}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isOpen} maxWidth="sm" fullWidth className="edit-dialog">
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
              className="add-user__field"
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
              className="add-user__field"
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
          <FormControl className="add-user__field" fullWidth classes={{ root: 'add-user__form-container' }} variant="outlined">
            <InputLabel id="select-project-label">Add all users from another Project</InputLabel>
            <Select
              placeholder="Choose project from drop down"
              labelId="select-project-label"
              label="Select Project"
              disabled={!managerAccess}
              onChange={handleAddAllUsersToProject}
            >
              {projectSelectOptions}
            </Select>
          </FormControl>
          <DataTable
            rowData={users}
            columnDefs={userColumnDefs}
            canViewDetails={false}
            onDelete={handleUserDelete}
            canDelete
            canToggleColumns={false}
            canExport={false}
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
                canToggleColumns={false}
                canExport={false}
              />
            )}
        </DialogContent>
        <DialogActions className="edit-dialog__actions">
          <Button color="primary" onClick={() => onClose(null, false)}>
            Cancel
          </Button>
          <AsyncButton
            color="primary"
            disabled={isReportsLoading || isSaving}
            onClick={handleClose}
            isLoading={isSaving}
          >
            Save
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddEditProjectDialog;
