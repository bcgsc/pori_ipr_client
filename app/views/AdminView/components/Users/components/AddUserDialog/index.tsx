import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
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
} from '@material-ui/core';

import api, { ApiCallSet } from '../../../../../../services/api';

import './index.scss';

const AddUserDialog = ({
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);

  const [projectOptions, setProjectOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [errors, setErrors] = useState('');

  useEffect(() => {
    const getData = async () => {
      const callSet = new ApiCallSet([
        api.get('/project', {}),
        api.get('/user/group', {}),
      ]);
      const [projectsResp, groupsResp] = await callSet.request();
      setProjectOptions(projectsResp);
      setGroupOptions(groupsResp);
    };
    getData();
  }, []);

  const handleClose = useCallback(async () => {
    if (username.length && firstName.length && lastName.length && email.length) {
      const newEntry = {
        username,
        firstName,
        lastName,
        email,
        type: 'bcgsc',
      };
      const createdResp = await api.post('/user', newEntry, {}).request();

      if (projects.length) {
        const callSet = new ApiCallSet(projects.map(project => api.post(`/project/${project.ident}/user`, { user: createdResp.ident }, {})));
        await callSet.request();
        createdResp.projects = projects;
      } else {
        createdResp.projects = [];
      }

      if (groups.length) {
        const callSet = new ApiCallSet(groups.map(group => api.post(`/user/group/${group.ident}/member`, { user: createdResp.ident }, {})));
        await callSet.request();
        createdResp.groups = groups;
      } else {
        createdResp.groups = [];
      }
      
      onClose(createdResp);
    } else {
      setErrors('Required fields missing');
    }
  }, [username, firstName, lastName, email, projects, groups]);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleProjectsChange = (event) => {
    setProjects(event.target.value);
  };

  const handleGroupsChange = (event) => {
    setGroups(event.target.value);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>Add user</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="outlined">
          <TextField
            value={username}
            onChange={handleUsernameChange}
            label="Username"
            variant="outlined"
            className="add-user__text-field"
            required
          />
        </FormControl>
        <FormControl fullWidth classes={{ root: 'add-user__form-container' }} variant="outlined">
          <TextField
            value={firstName}
            fullWidth
            onChange={handleFirstNameChange}
            label="First Name"
            variant="outlined"
            className="add-user__text-field"
            required
          />
          <TextField
            value={lastName}
            fullWidth
            onChange={handleLastNameChange}
            label="Last Name"
            variant="outlined"
            className="add-user__text-field"
            required
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <TextField
            value={email}
            onChange={handleEmailChange}
            label="Email"
            variant="outlined"
            className="add-user__text-field"
            required
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          {Boolean(projectOptions.length) && (
            <>
              <InputLabel className="add-user__select" id="projects-select">Projects</InputLabel>
              <Select
                id="projects-select"
                multiple
                label="Projects"
                value={projects}
                autoWidth
                variant="outlined"
                onChange={handleProjectsChange}
                className="add-user__select"
                renderValue={values => `${values.map(val => val.name).join(', ')}`}
              >
                {projectOptions.map(project => (
                  <MenuItem key={project.name} value={project}>
                    <Checkbox checked={projects.includes(project)}/>
                    <ListItemText>
                      {project.name}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </FormControl>
        <FormControl fullWidth variant="outlined">
          {Boolean(groupOptions.length) && (
            <>
              <InputLabel className="add-user__select" id="groups-select">Groups</InputLabel>
              <Select
                id="groups-select"
                multiple
                label="Groups"
                value={groups}
                autoWidth
                variant="outlined"
                onChange={handleGroupsChange}
                className="add-user__select"
                renderValue={values => `${values.map(val => val.name).join(', ')}`}
              >
                {groupOptions.map(group => (
                  <MenuItem key={group.name} value={group}>
                    <Checkbox checked={groups.includes(group)}/>
                    <ListItemText>
                      {group.name}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions className="edit-dialog__actions">
        <Button color="primary" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleClose}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;
