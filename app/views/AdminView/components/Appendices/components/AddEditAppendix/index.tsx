import React, {
  useState, useCallback, useEffect,
} from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import snackbar from '@/services/SnackbarUtils';

import api from '@/services/api';
import './index.scss';
import {
  ProjectType, TemplateType,
} from '../../../../types';

type AddEditAppendixProps = {
  isOpen: boolean;
  onClose: (newData?: Record<string, unknown>) => void;
};

const AddEditAppendix = ({
  isOpen,
  onClose,
}: AddEditAppendixProps): JSX.Element => {
  const [dialogTitle, setDialogTitle] = useState('');
  const [project, setProject] = useState<ProjectType>();
  const [projectOptions, setProjectOptions] = useState<ProjectType[]>();
  const [template, setTemplate] = useState<TemplateType>();
  const [templateOptions, setTemplateOptions] = useState<TemplateType[]>();
  const [projectMenuOptions, setProjectMenuOptions] = useState<unknown[]>();
  const [templateMenuOptions, setTemplateMenuOptions] = useState<unknown[]>();
  const [templateSelected, setTemplateSelected] = useState<boolean>(false);

  // Grab project and groups
  useEffect(() => {
    setDialogTitle('Select Template and Project');
    let cancelled = false;
    const getData = async () => {
      const [projectsResp, templatesResp] = await Promise.all([
        api.get('/project').request(),
        api.get('/templates').request(),
      ]);
      if (!cancelled) {
        setProjectOptions(projectsResp);
        setTemplateOptions(templatesResp);
      }
    };
    getData();
    return function cleanup() { cancelled = true; };
  }, []);

  const handleTemplateChange = (event) => {
    setTemplate(event.target.value);
  };

  const handleProjectChange = (event) => {
    setProject(event.target.value);
  };

  useEffect(() => {
    if (projectOptions) {
      const projopts = projectOptions.map((proj) => (
        <MenuItem
          value={proj}
          key={proj.name}
          onChange={handleProjectChange}
        >
          {' '}
          {proj.name}
        </MenuItem>
      ));
      setProjectMenuOptions(projopts);
    }
    if (templateOptions) {
      const tempopts = templateOptions.map((temp) => (
        <MenuItem
          value={temp}
          key={temp.name}
          onChange={handleTemplateChange}
        >
          {' '}
          {temp.name}
        </MenuItem>
      ));
      setTemplateMenuOptions(tempopts);
    }
  }, [projectOptions, templateOptions]);

  useEffect(() => {
    if (template) {
      setTemplateSelected(true);
    } else {
      setTemplateSelected(false);
    }
  }, [template]);

  const handleSubmit = useCallback(async () => {
    try {
      let res;
      if (project) {
        res = await api.post(`/appendix?templateId=${template.ident}&projectId=${project.ident}`, { text: 'Edit me' }).request();
      } else {
        res = await api.post(`/appendix?templateId=${template.ident}`, { text: 'Edit me' }).request();
      }
      snackbar.success('Appendix record created successfully');
      setTemplate(null);
      setProject(null);
      onClose(res);
    } catch (err) {
      if (err.message && err.message.includes('[409]')) {
        let projectStr = '';
        if (project) {
          projectStr = `and project ${project.name}`;
        } else {
          projectStr = '(default appendix text)';
        }
        snackbar.error(`Error creating appendix record: record already exists for pair: template ${template.name} ${projectStr}`);
      } else {
        snackbar.error(`Error creating appendix reord: ${err}`);
      }
    }
  }, [project, template, onClose]);

  return (
    <Dialog
      open={isOpen}
      maxWidth="sm"
      fullWidth
      className="edit-dialog"
      onClose={() => onClose(null)}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <InputLabel id="template-select-label">Template</InputLabel>
          <Select
            variant="outlined"
            className="add-item__text-field"
            fullWidth
            required
            defaultValue={null}
            id="template-select"
            label="Template"
            onChange={handleTemplateChange}
          >
            {templateMenuOptions}
          </Select>
        </FormControl>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <InputLabel id="projects-select-label">Project</InputLabel>
          <Select
            defaultValue={null}
            id="projects-select"
            label="Project"
            variant="outlined"
            className="add-item__text-field"
            fullWidth
            required
            onChange={handleProjectChange}
          >
            {projectMenuOptions}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setTemplate(null);
            setProject(null);
            onClose(null);
          }}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          disabled={!templateSelected}
          onClick={handleSubmit}
          color="secondary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditAppendix;
