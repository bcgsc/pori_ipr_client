/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  ListItemText,
  Checkbox,
  InputLabel,
  Typography,
  FormControlLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import api, { ApiCallSet } from '@/services/api';
import { UserType, GroupType, UserProjectsType } from '@/common';
import snackbar from '@/services/SnackbarUtils';
import AsyncButton from '@/components/AsyncButton';
import UserAutocomplete from '@/components/UserAutocomplete';
import useSecurity from '@/hooks/useSecurity';
import useResource from '@/hooks/useResource';
import {
  ErrorMixin,
} from '@/services/errors/errors';

import './index.scss';
import { useMutation, useQuery } from 'react-query';

const fetchProjects = async () => {
  const projectsResp = await api.get('/project').request();
  return projectsResp;
};

const fetchGroups = async () => {
  const groupsResp = await api.get('/user/group').request();
  return groupsResp;
};

const addModifyUser = async ({ formData, userIdent }: { formData: UserForm, userIdent: string }) => {
  const userReq: Partial<UserType> = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    username: formData.username,
    type: formData.type,
  };
  if (userIdent) {
    return api.put(`/user/${userIdent}`, userReq).request();
  }
  return api.post('/user', userReq).request();
};

type AddToGraphKbUserParams = Pick<UserType, 'email' | 'username'>;
const addGraphKbUserMutation = async (userObject: AddToGraphKbUserParams) => api.post('/graphkb/new-user', userObject).request();

type ModifyUserProjectsFnType = {
  existingProjectsIds: string[];
  newProjectsIds: string[];
  userId: string;
  username?: string;
};

type ModifyUserGroupsFnType = {
  existingGroupsIds: string[];
  newGroupsIds: string[];
  userId: string;
  username?: string;
};

const modifyUserProjects = async ({
  existingProjectsIds, newProjectsIds, userId,
}: ModifyUserProjectsFnType) => {
  const toAddProjs = newProjectsIds.filter((projectId) => !existingProjectsIds.includes(projectId));
  const toRemoveProjs = existingProjectsIds.filter((projectId) => !newProjectsIds.includes(projectId));
  const callSet = new ApiCallSet([
    ...toAddProjs.map((projectId) => api.post(`/project/${projectId}/user`, { user: userId }, {})),
    ...toRemoveProjs.map((projectId) => api.del(`/project/${projectId}/user`, { user: userId }, {})),
  ]);
  return callSet.request();
};

const modifyUserGroups = async ({
  existingGroupsIds, newGroupsIds, userId,
}: ModifyUserGroupsFnType) => {
  const toAddGroups = newGroupsIds.filter((projectId) => !existingGroupsIds.includes(projectId));
  const toRemoveGroups = existingGroupsIds.filter((projectId) => !newGroupsIds.includes(projectId));
  const callSet = new ApiCallSet([
    ...toAddGroups.map((groupId) => api.post(`/user/group/${groupId}/member`, { user: userId }, {})),
    ...toRemoveGroups.map((groupId) => api.del(`/user/group/${groupId}/member`, { user: userId }, {})),
  ]);
  return callSet.request();
};

// RFC 5322 regex for email
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

type AddEditUserDialogProps = {
  isOpen: boolean;
  onClose: (newData: boolean) => void;
  editData: null | UserType;
};

// Forced to use primitves, due to design limitation of library
// https://github.com/react-hook-form/react-hook-form/discussions/7764
type UserForm = {
  email: string;
  deletedAt: null | string;
  firstName: string;
  groups: GroupType['ident'][];
  lastLogin: null | string;
  lastName: string;
  projects: UserProjectsType['ident'][];
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
    defaultValues: useMemo(() => {
      if (editData) {
        return ({
          username: editData.username,
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email,
          projects: editData.projects.map(({ ident }) => ident),
          groups: editData.groups.map(({ ident }) => ident),
          type: editData.type,
        });
      }
      return ({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        projects: [],
        groups: [],
        type: CONFIG.STORAGE.DATABASE_TYPE,
      });
    }, [editData]),
  });

  const [projectOptions, setProjectOptions] = useState<UserProjectsType[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupType[]>([]);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [isApiCalling, setIsApiCalling] = useState(false);
  const [gkbAdd, setGkbAdd] = useState(false);
  const { userDetails } = useSecurity();
  const { adminAccess, allProjectsAccess } = useResource();

  const addUserToGKBMutation = useMutation({
    mutationFn: addGraphKbUserMutation,
    onSuccess: (_data, { username }) => {
      snackbar.success(`Successfully added user ${username} to GraphKb`);
    },
    onError: (err: ErrorMixin) => {
      const { error } = err.toJSON();
      snackbar.error(`Cannot add user to GraphKb: ${error.message}`);
    },
  });

  const userProjectsMutation = useMutation({
    mutationFn: modifyUserProjects,
    onSuccess: (_data, { userId, username }) => {
      if (!userId) {
        snackbar.success(`Successfully added ${username} to projects.`);
      } else {
        snackbar.success(`Successfully edited ${username}'s projects.`);
      }
    },
    onError: (err: ErrorMixin) => {
      const { error } = err.toJSON();
      snackbar.error(`Cannot add user to projects: ${error.message}`);
    },
  });

  const userGroupsMutation = useMutation({
    mutationFn: modifyUserGroups,
    onSuccess: (_data, { userId, username }) => {
      if (!userId) {
        snackbar.success(`Successfully added ${username} to groups.`);
      } else {
        snackbar.success(`Successfully edited ${username}'s groups.`);
      }
    },
    onError: (err: ErrorMixin) => {
      const { error } = err.toJSON();
      snackbar.error(`Cannot add user to groups: ${error.message}`);
    },
  });

  const addModifyUserMutation = useMutation({
    mutationFn: addModifyUser,
    onMutate: () => {
      setIsApiCalling(true);
      return ({ editData, gkbAdd });
    },
    onSuccess: async (data, { formData, userIdent }, { editData: contextEditData, gkbAdd: contextGkbAdd }) => {
      const {
        groups,
        projects,
        username,
      } = formData;

      if (!userIdent) {
        snackbar.success(`Successfully added ${username} to IPR`);
      } else {
        snackbar.success(`Successfully edited ${username}`);
      }

      const existingProjects = contextEditData?.projects.map(({ ident }) => ident) || [];
      const existingGroups = contextEditData?.groups.map(({ ident }) => ident) || [];

      try {
        await Promise.all([
          contextGkbAdd
          && addUserToGKBMutation.mutateAsync(formData).catch(),
          dirtyFields.projects
          && userProjectsMutation.mutateAsync({
            existingProjectsIds: existingProjects,
            newProjectsIds: projects,
            userId: data.ident,
            username,
          }),
          dirtyFields.groups
          && userGroupsMutation.mutateAsync({
            existingGroupsIds: existingGroups,
            newGroupsIds: groups,
            userId: data.ident,
            username,
          }),
        ]);

        onClose(true);
      } catch (e) {
        // Empty catch here, do not want to trigger another error response in this handler
      } finally {
        // Send onClose to refech, because new user is added
        onClose(true);
      }
    },
    onError: (err: ErrorMixin) => {
      const { error } = err.toJSON();
      snackbar.error(`Cannot add user: ${error.message}`);
    },
    onSettled: () => {
      setIsApiCalling(false);
    },
  });

  // Grab project and groups
  const { data: projects, isLoading: isProjectsLoading } = useQuery('user/projects', fetchProjects, {
    onError: (e: ErrorMixin) => {
      snackbar.error('Cannot load user projects');
      console.error(e.toJSON());
    },
  });
  const { data: groups, isLoading: isGroupsLoading } = useQuery('user/groups', fetchGroups, {
    onError: (e: ErrorMixin) => {
      snackbar.error('Cannot load user groups');
      console.error(e.toJSON());
    },
  });

  useEffect(() => {
    if (projects?.length && groups?.length) {
      const nonAdminGroups = groups.filter((group) => (group.name !== 'admin'));
      if (adminAccess) {
        setProjectOptions(projects);
        setGroupOptions(groups);
      } else if (editData) {
        // Editing existing entry
        const combinedProjects = userDetails.projects.concat(editData.projects);
        const combinedUniqueProjects = [...new Map(combinedProjects.map((project) => [project.ident, project])).values()];

        setProjectOptions(allProjectsAccess ? projects : combinedUniqueProjects);
        setGroupOptions(nonAdminGroups);
      } else {
        // New entry
        setProjectOptions(allProjectsAccess ? projects : userDetails.projects);
        setGroupOptions(nonAdminGroups);
      }
    }
  }, [adminAccess, projects, groups, editData, userDetails.projects, allProjectsAccess]);

  // When params changed
  useEffect(() => {
    if (editData) {
      setDialogTitle('Edit user');
    } else {
      setDialogTitle('Add user');
    }
  }, [editData]);

  const handleCopyUserProjects = useCallback(async (user) => {
    const userResp = await api.get(`/user/${user.ident}`, {}).request();
    const copiedProjects = { projects: userResp.projects };
    const availableProjectIdents = projectOptions.map((project) => project.ident);
    copiedProjects.projects = copiedProjects.projects.filter((project: { ident: string; }) => (availableProjectIdents.includes(project.ident))); // Filter copied projects to be only ones where adding manager has access to
    Object.entries(copiedProjects).forEach(([key, val]) => {
      let nextVal = val;
      if (Array.isArray(val)) {
        nextVal = val.map(({ ident }) => ident);
      }
      setValue(key as keyof UserForm, nextVal as string | string[], { shouldDirty: true });
    });
  }, [projectOptions, setValue]);

  const handleCopyUserGroups = useCallback(async (user) => {
    const userResp = await api.get(`/user/${user.ident}`, {}).request();
    const copiedGroups = { groups: userResp.groups };
    copiedGroups.groups = copiedGroups.groups.filter((group: { name: string; }) => (group.name !== 'admin')); // Remove possible admin from copied groups
    Object.entries(copiedGroups).forEach(([key, val]) => {
      let nextVal = val;
      if (Array.isArray(val)) {
        nextVal = val.map(({ ident }) => ident);
      }
      setValue(key as keyof UserForm, nextVal as string | string[], { shouldDirty: true });
    });
  }, [setValue]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGkbAdd(event.target.checked);
  };

  const handleClose = useCallback(async (formData: UserForm) => {
    if (Object.keys(dirtyFields).length > 0) {
      addModifyUserMutation.mutate({ formData, userIdent: editData?.ident });
    } else {
      onClose(null);
    }
  }, [dirtyFields, onClose, addModifyUserMutation, editData?.ident]);

  // Email error text
  let emailErrorText = '';
  if (formErrors.email) {
    const { type } = formErrors.email;
    if (type === 'required') emailErrorText = 'Email is required';
    if (type === 'pattern') emailErrorText = 'Email format is invalid';
  }

  const projectSelectSection = useMemo(() => (
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
            disabled={!projectOptions.length}
            {...field}
          >
            {projectOptions.length && projectOptions.map((project) => (
              <MenuItem
                key={project.ident}
                value={project.ident}
                disabled={
                  !adminAccess
                  && !userDetails?.projects.some((proj) => proj.ident === project.ident)
                  && editData?.projects.some((proj) => proj.ident === project.ident)
                }
              >
                <Checkbox
                  checked={Boolean(value?.find((v) => v === project.ident))}
                />
                <ListItemText>{project.name}</ListItemText>
              </MenuItem>
            ))}
          </Select>
        )}
      />
    </FormControl>
  ), [adminAccess, control, editData?.projects, projectOptions, userDetails?.projects]);

  const groupSelectionSection = useMemo(() => (
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
            disabled={!groupOptions.length}
            {...field}
          >
            {groupOptions.length && groupOptions.map((group) => (
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
  ), [control, groupOptions]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose(null)}
      maxWidth="sm"
      className="edit-dialog"
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <Typography
        className="edit-dialog__new-user-notice"
        color="red"
        variant="caption"
      >
        User must also be added to Keycloak with the roles IPR and GraphKB.
        If you are at the BCGSC, make a Systems ticket to request that this user be added, specifying their email address.
      </Typography>
      <Divider><Typography variant="caption">User Information</Typography></Divider>
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
        <FormControl fullWidth variant="outlined" sx={{ paddingBottom: 2 }}>
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
        <Divider><Typography variant="caption">Database</Typography></Divider>
        <FormControl fullWidth variant="outlined" sx={{ marginTop: 2, marginBottom: 2 }}>
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
        <Divider><Typography variant="caption">Projects and Groups</Typography></Divider>
        <UserAutocomplete
          onSubmitProjects={handleCopyUserProjects}
          onSubmitGroups={handleCopyUserGroups}
          label="Copy an existing user's projects and groups"
          addEditUserDialog
        />
        {!(isProjectsLoading || isGroupsLoading) ? (
          <>
            {projectSelectSection}
            {groupSelectionSection}
          </>
        ) : (
          <div className="add-user__loading">
            <CircularProgress />
          </div>
        )}
      </DialogContent>
      <DialogActions className="add-user__actions">
        <FormControlLabel
          className="add-user__checkbox"
          label="Also create user on GraphKB"
          control={
            <Checkbox checked={gkbAdd} onChange={handleCheckboxChange} />
          }
          disabled={Boolean(editData)}
        />
        <AsyncButton isLoading={isApiCalling} color="inherit" onClick={() => onClose(null)}>
          Cancel
        </AsyncButton>
        <AsyncButton isLoading={isApiCalling} color="primary" onClick={handleSubmit(handleClose)}>
          Save
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditUserDialog;
