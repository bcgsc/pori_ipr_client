/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { useForm, Controller } from 'react-hook-form';
import api, { ApiCallSet } from '@/services/api';
import { UserType, GroupType } from '@/common';
import snackbar from '@/services/SnackbarUtils';
import {
  ProjectType,
} from '../../../../types';

import './index.scss';

// RFC 5322 regex for email
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

type AddEditUserDialogProps = {
  isOpen: boolean;
  onClose: (newData?: null | UserType) => void;
  editData: null | UserType;
};

// Forced to use primitves, due to design limitation of library
// https://github.com/react-hook-form/react-hook-form/discussions/7764
type UserForm = {
  email: string;
  deletedAt: null | string;
  firstName: string;
  groups: string[];
  lastLogin: null | string;
  lastName: string;
  projects: string[];
  // Db type
  type: string;
  username: string;
};

const AddEditUserDialog = ({
  isOpen,
  onClose,
  editData,
}: AddEditUserDialogProps): JSX.Element => {
  const {
    register, control, handleSubmit, formState: { errors: formErrors, dirtyFields }, setValue,
  } = useForm<UserForm>({
    mode: 'onTouched',
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      projects: [],
      groups: [],
      type: CONFIG.STORAGE.DATABASE_TYPE,
    },
  });

  const [projectOptions, setProjectOptions] = useState<ProjectType[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupType[]>([]);
  const [dialogTitle, setDialogTitle] = useState<string>('');

  // Grab project and groups
  useEffect(() => {
    let cancelled = false;
    const getData = async () => {
      const [projectsResp, groupsResp] = await Promise.all([
        api.get('/project').request(),
        api.get('/user/group').request(),
      ]);
      if (!cancelled) {
        setProjectOptions(projectsResp);
        setGroupOptions(groupsResp);
      }
    };
    getData();
    return function cleanup() { cancelled = true; };
  }, [editData]);

  // When params changed
  useEffect(() => {
    if (editData) {
      setDialogTitle('Edit user');
      Object.entries(editData).forEach(([key, val]) => {
        let nextVal = val;
        if (Array.isArray(val)) {
          nextVal = val.map(({ ident }) => ident);
        }
        setValue(key as keyof UserForm, nextVal as string | string[]);
      });
    } else {
      setDialogTitle('Add user');
    }
  }, [editData, groupOptions, projectOptions, setValue]);

  const handleClose = useCallback(async (formData: UserForm) => {
    const {
      firstName,
      lastName,
      email,
      groups,
      projects,
      type,
      username,
    } = formData;

    if (Object.keys(dirtyFields).length > 0) {
      const userReq = {
        firstName,
        lastName,
        email,
        username,
        type,
      };

      try {
        const addEditResp = editData
          ? await api.put(`/user/${editData.ident}`, userReq).request()
          : await api.post('/user', userReq).request();

        // Project Section
        if (dirtyFields.projects && editData) {
          const existingProjects = editData.projects.map(({ ident }) => ident);

          const toAddProjs = projects.filter((projectId) => !existingProjects.includes(projectId));
          const toRemoveProjs = existingProjects.filter((projectId) => !projects.includes(projectId));

          const callSet = new ApiCallSet([
            ...toAddProjs.map((projectId) => api.post(`/project/${projectId}/user`, { user: addEditResp.ident }, {})),
            ...toRemoveProjs.map((projectId) => api.del(`/project/${projectId}/user`, { user: addEditResp.ident }, {})),
          ]);
          try {
            await callSet.request();
          } catch (e) {
            throw { ...e, errorType: 'project' };
          }
        }

        // Groups Section
        if (dirtyFields.groups && editData) {
          const existingGroups = editData.groups.map(({ ident }) => ident);

          const toAddGroups = groups.filter((groupId) => !existingGroups.includes(groupId));
          const toRemoveGroups = existingGroups.filter((groupId) => !groups.includes(groupId));

          const callSet = new ApiCallSet([
            ...toAddGroups.map((groupId) => api.post(`/user/group/${groupId}/member`, { user: addEditResp.ident }, {})),
            ...toRemoveGroups.map((groupId) => api.del(`/user/group/${groupId}/member`, { user: addEditResp.ident }, {})),
          ]);
          try {
            await callSet.request();
          } catch (e) {
            throw { ...e, errorType: 'group' };
          }
        }
        addEditResp.projects = projectOptions.filter(({ ident }) => projects.includes(ident));
        addEditResp.groups = groupOptions.filter(({ ident }) => groups.includes(ident));

        snackbar.success(`User successfully ${editData ? 'updated' : 'created'}`);
        onClose(addEditResp);
      } catch (e) {
        if (e.errorType) {
          snackbar.error(`Error setting ${e.errorType}s related to user`);
        } else {
          snackbar.error(`Error ${editData ? 'editing' : 'creating'} user`);
        }
        console.error(e);
      }
    }

    onClose(null);
  }, [dirtyFields, editData, onClose, projectOptions, groupOptions]);

  // Email error text
  let emailErrorText = '';
  if (formErrors.email) {
    const { type } = formErrors.email;
    if (type === 'required') emailErrorText = 'Email is required';
    if (type === 'pattern') emailErrorText = 'Email format is invalid';
  }

  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose(null)}
      maxWidth="sm"
      fullWidth
      className="edit-dialog"
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="outlined">
          <TextField
            label="Username"
            variant="outlined"
            error={Boolean(formErrors.username)}
            helperText={formErrors.username?.type === 'required' ? 'Username is required' : null}
            className="add-user__text-field"
            disabled={Boolean(editData)}
            required={!editData}
            {...register('username', { required: !editData })}
          />
        </FormControl>
        <FormControl fullWidth classes={{ root: 'add-user__form-container' }} variant="outlined">
          <TextField
            fullWidth
            label="First Name"
            variant="outlined"
            error={Boolean(formErrors.firstName)}
            helperText={formErrors.firstName?.type === 'required' ? 'First name is required' : null}
            className="add-user__text-field"
            required
            {...register('firstName', { required: true })}
          />
          <TextField
            fullWidth
            label="Last Name"
            variant="outlined"
            error={Boolean(formErrors.lastName)}
            helperText={formErrors.lastName?.type === 'required' ? 'Last name is required' : null}
            className="add-user__text-field"
            required
            {...register('lastName', { required: true })}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <TextField
            label="Email"
            variant="outlined"
            error={Boolean(formErrors.email)}
            className="add-user__text-field"
            required
            helperText={emailErrorText}
            {...register('email', { required: true, pattern: EMAIL_REGEX })}
          />
        </FormControl>

        <FormControl fullWidth variant="outlined">
          <InputLabel className="add-user__select" id="db-select">Database Type</InputLabel>
          <Select
            id="db-select"
            label="Database Type"
            autoWidth
            disabled={Boolean(editData)}
            variant="outlined"
            className="add-user__select"
            defaultValue={CONFIG.STORAGE.DATABASE_TYPE}
            {...register('type')}
          >
            <MenuItem value={CONFIG.STORAGE.DATABASE_TYPE}>{CONFIG.STORAGE.DATABASE_TYPE}</MenuItem>
            <MenuItem value="local">local</MenuItem>
          </Select>
        </FormControl>
        {projectOptions.length && groupOptions.length ? (
          <>
            <FormControl fullWidth variant="outlined">
              <InputLabel className="add-user__select" id="projects-select">Projects</InputLabel>
              <Controller
                name="projects"
                control={control}
                render={({
                  field,
                  field: {
                    value,
                  },
                }) => (
                  <Select
                    id="projects-select"
                    multiple
                    label="Projects"
                    autoWidth
                    variant="outlined"
                    className="add-user__select"
                    renderValue={(values) => `${values.map((val) => projectOptions.find(({ ident }) => ident === val)?.name).join(', ')}`}
                    {...field}
                  >
                    {projectOptions.map((project) => (
                      // @ts-ignore - MUI limitations on having value as an object
                      <MenuItem key={project.ident} value={project.ident}>
                        <Checkbox checked={Boolean(value?.find((v) => v === project.ident))} />
                        <ListItemText>{project.name}</ListItemText>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel className="add-user__select" id="groups-select">Groups</InputLabel>
              <Controller
                name="groups"
                control={control}
                render={({
                  field,
                  field: {
                    value,
                  },
                }) => (
                  <Select
                    id="groups-select"
                    multiple
                    label="groups"
                    autoWidth
                    variant="outlined"
                    className="add-user__select"
                    renderValue={(values) => `${values.map((val) => groupOptions.find(({ ident }) => ident === val)?.name).join(', ')}`}
                    {...field}
                  >
                    {groupOptions.map((group) => (
                      // @ts-ignore - MUI limitations on having value as an object
                      <MenuItem key={group.ident} value={group.ident}>
                        <Checkbox checked={Boolean(value?.find((v) => v === group.ident))} />
                        <ListItemText>{group.name}</ListItemText>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </>
        ) : (
          <div className="add-user__loading">
            <CircularProgress />
          </div>
        )}
      </DialogContent>
      <DialogActions className="edit-dialog__actions">
        <Button color="primary" onClick={() => onClose(null)}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit(handleClose)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditUserDialog;
