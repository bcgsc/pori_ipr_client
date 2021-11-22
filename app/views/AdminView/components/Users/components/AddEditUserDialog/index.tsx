import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  ListItemText,
  Checkbox,
  InputLabel,
} from '@mui/material';

import api from '@/services/api';
import { UserType, GroupType } from '@/common';
import {
  ProjectType, FormErrorType,
} from '../../../../types';

import './index.scss';

type AddEditUserDialogProps = {
  isOpen: boolean;
  onClose: (newData?: null | UserType) => void;
  editData: null | UserType;
};

const AddEditUserDialog = ({
  isOpen,
  onClose,
  editData,
}: AddEditUserDialogProps): JSX.Element => {
  const [username, setUsername] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [dbType, setDbType] = useState<string>(CONFIG.STORAGE.DATABASE_TYPE);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);

  const [projectOptions, setProjectOptions] = useState<ProjectType[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupType[]>([]);
  const [errors, setErrors] = useState<FormErrorType>({
    username: false,
    firstName: false,
    lastName: false,
    email: false,
  });
  const [emailValidationError, setEmailValidationError] = useState<string>('');
  const [dialogTitle, setDialogTitle] = useState<string>('');

  useEffect(() => {
    const getData = async () => {
      const [projectsResp, groupsResp] = await Promise.all([
        api.get<ProjectType[]>('/project').request(),
        api.get<GroupType[]>('/user/group').request(),
      ]);
      setProjectOptions(projectsResp);
      setGroupOptions(groupsResp);
    };
    getData();
  }, [editData]);

  useEffect(() => {
    if (editData) {
      const {
        username: editUsername,
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        projects: editProjects,
        groups: editGroups,
        type: editDbType,
      } = editData;

      setDialogTitle('Edit user');
      setUsername(editUsername);
      setFirstName(editFirstName);
      setLastName(editLastName);
      setEmail(editEmail);
      setProjects(projectOptions.filter((project) => editProjects.some((editProject) => editProject.name === project.name)));
      setGroups(groupOptions.filter((group) => editGroups.some((editGroup) => editGroup.name === group.name)));
      setDbType(editDbType);
    } else {
      setDialogTitle('Add user');
      setUsername('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setProjects([]);
      setGroups([]);
      setDbType(CONFIG.STORAGE.DATABASE_TYPE);
    }
  }, [editData, groupOptions, projectOptions]);

  const handleClose = useCallback(async () => {
    if (username.length && firstName.length && lastName.length && email.length) {
      if (!email.match(/^\S+@\S+$/)) {
        setEmailValidationError('Email format is incorrect');
        return;
      }

      const newEntry = {
        username,
        firstName,
        lastName,
        email,
        type: dbType,
      };

      let createdResp: UserType;
      if (editData) {
        createdResp = await api.put<UserType>(`/user/${editData.ident}`, newEntry).request();
      } else {
        createdResp = await api.post<UserType>('/user', newEntry).request();
      }

      if (projects.length) {
        const callSet = [];
        projects.forEach((project) => (
          callSet.push(api.post<ProjectType>(`/project/${project.ident}/user`, { user: createdResp.ident }).request())
        ));
        await Promise.all(callSet);
        createdResp.projects = projects.map((project) => ({ ident: project.ident, name: project.name }));
      } else {
        createdResp.projects = [];
      }

      if (groups.length) {
        const callSet = [];
        groups.forEach((group) => (
          callSet.push(api.post<GroupType>(`/user/group/${group.ident}/member`, { user: createdResp.ident }).request())
        ));
        await Promise.all(callSet);
        createdResp.groups = groups;
      } else {
        createdResp.groups = [];
      }
      
      onClose(createdResp);
    } else {
      setErrors({
        username: !username.length,
        firstName: !firstName.length,
        lastName: !lastName.length,
        email: !email.length,
      });
    }
  }, [username, firstName, lastName, email, dbType, editData, projects, groups, onClose]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="outlined">
          <TextField
            value={username}
            onChange={({ target: { value } }) => setUsername(value)}
            label="Username"
            variant="outlined"
            error={errors.username}
            helperText={errors.username ? 'Username is required' : null}
            className="add-user__text-field"
            disabled={Boolean(editData)}
            required={!editData}
          />
        </FormControl>
        <FormControl fullWidth classes={{ root: 'add-user__form-container' }} variant="outlined">
          <TextField
            value={firstName}
            fullWidth
            onChange={({ target: { value } }) => setFirstName(value)}
            label="First Name"
            variant="outlined"
            error={errors.firstName}
            helperText={errors.firstName ? 'First name is required' : null}
            className="add-user__text-field"
            required
          />
          <TextField
            value={lastName}
            fullWidth
            onChange={({ target: { value } }) => setLastName(value)}
            label="Last Name"
            variant="outlined"
            error={errors.lastName}
            helperText={errors.lastName ? 'Last name is required' : null}
            className="add-user__text-field"
            required
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <TextField
            value={email}
            onChange={({ target: { value } }) => setEmail(value)}
            label="Email"
            variant="outlined"
            error={errors.email || Boolean(emailValidationError)}
            helperText={emailValidationError}
            className="add-user__text-field"
            required
          />
        </FormControl>

        <FormControl fullWidth variant="outlined">
          <InputLabel className="add-user__select" id="db-select">Database Type</InputLabel>
          <Select
            id="db-select"
            label="Database Type"
            value={dbType}
            autoWidth
            disabled={Boolean(editData)}
            variant="outlined"
            onChange={({ target: { value } }) => setDbType(value)}
            className="add-user__select"
          >
            <MenuItem value={CONFIG.STORAGE.DATABASE_TYPE}>{CONFIG.STORAGE.DATABASE_TYPE}</MenuItem>
            <MenuItem value="local">local</MenuItem>
          </Select>
        </FormControl>
        {projectOptions.length && groupOptions.length ? (
          <>
            <FormControl fullWidth variant="outlined">
              <InputLabel className="add-user__select" id="projects-select">Projects</InputLabel>
              <Select
                id="projects-select"
                multiple
                label="Projects"
                value={projects}
                autoWidth
                variant="outlined"
                onChange={({ target: { value } }) => setProjects(value)}
                className="add-user__select"
                renderValue={(values: ProjectType[]) => `${values.map((val) => val.name).join(', ')}`}
              >
                {projectOptions.map((project) => (
                  <MenuItem key={project.name} value={project}>
                    <Checkbox checked={projects.includes(project)} />
                    <ListItemText>
                      {project.name}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel className="add-user__select" id="groups-select">Groups</InputLabel>
              <Select
                id="groups-select"
                multiple
                label="Groups"
                value={groups}
                autoWidth
                variant="outlined"
                onChange={({ target: { value } }) => setGroups(value)}
                className="add-user__select"
                renderValue={(values: GroupType[]) => `${values.map((val) => val.name).join(', ')}`}
              >
                {groupOptions.map((group) => (
                  <MenuItem key={group.name} value={group}>
                    <Checkbox checked={groups.includes(group)} />
                    <ListItemText>
                      {group.name}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        ) : (
          <div className="add-user__loading">
            <CircularProgress />
          </div>
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

export default AddEditUserDialog;
