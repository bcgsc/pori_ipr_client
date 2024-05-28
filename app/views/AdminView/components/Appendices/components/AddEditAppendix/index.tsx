import React, {
  useState, useCallback, useEffect,
} from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  ListItemText,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useSnackbar } from 'notistack';

import { ImageType, RecordDefaults } from '@/common';
import api from '@/services/api';
import getImageDataURI from '@/utils/getImageDataURI';
import './index.scss';
import { Controller, useForm } from 'react-hook-form';
import AddEditProjectDialog from '@/views/ProjectsView/components/AddEditProjectDialog';
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
  const [project, setProject] = useState<any>();
  const [projectOptions, setProjectOptions] = useState<ProjectType[]>();
  const [template, setTemplate] = useState<any>();
  const [templateOptions, setTemplateOptions] = useState<TemplateType[]>();
  const [addData, setAddData] = useState();
  const [projectMenuOptions, setProjectMenuOptions] = useState<any>([]);
  const [templateMenuOptions, setTemplateMenuOptions] = useState<any>([]);
  const [templateSelected, setTemplateSelected] = useState<boolean>(false);
  const snackbar = useSnackbar();

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

  const handleTemplateChange = (event) => {
    setTemplate(event.target.value);
  };

  const handleProjectChange = (event) => {
    setProject(event.target.value);
  };

  const handleSubmit = useCallback(async () => {
    try {
      let res;
      if (project) {
        res = await api.post(`/appendix?templateId=${template.ident}&projectId=${project.ident}`, { text: 'Edit me' }).request();
      } else {
        res = await api.post(`/appendix?templateId=${template.ident}`, { text: 'Edit me' }).request();
      }
      snackbar.enqueueSnackbar('Appendix created successfully');
      setTemplate(null);
      setProject(null);
      onClose(res);
    } catch (err) {
      snackbar.enqueueSnackbar(`Error creating appendix: ${err}`);
    }
  }, [project, template, onClose, snackbar]);

  // TODO centre label text vertically in template and project boxes
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
