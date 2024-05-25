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
  import {
    ProjectType,TemplateType
  } from '../../../../types';
  import './index.scss';
  import { Controller, useForm } from 'react-hook-form';

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

    const snackbar = useSnackbar();

    // Grab project and groups
    useEffect(() => {
      setDialogTitle('Select Template and Project to begin editing appendix text');
      let cancelled = false;
        const getData = async () => {
          console.log('in getdata');
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
          key={proj.name}
          onClick={handleProjectChange}
        > {proj.name}
        </MenuItem>
      ));
      setProjectMenuOptions(projopts);
    }
      if (templateOptions) {
        const tempopts = templateOptions.map((temp) => (
        <MenuItem
          key={temp.name}
          onClick={handleTemplateChange}
        > {temp.name}
        </MenuItem>
      ));
      setTemplateMenuOptions(tempopts);
    }
    }, [projectOptions, templateOptions])

    const handleTemplateChange = useCallback(async () => {
      console.log('hello from handleTemplateChange')
      console.dir(template);
    }, [template]);

    const handleProjectChange = useCallback(async () => {
      console.log('hello from handleProjectChange')
      console.dir(project);
    }, [project]);

    const handleSubmit = useCallback(async () => {
      console.dir(template);
      console.dir(project);
      console.log('in handleSubmit');
      //handle case when appendix already exists for this combo
      if (template) {
        try {
          let resp;
            let res;
            if (project) {
                res = await api.post(`/appendix?templateId=${template.ident}&projectId=${project.ident}`,  { text: 'Edit me' }).request();
            } else {
                res = await api.post(`/appendix?templateId=${template.ident}`, { text: 'Edit me' }).request();
            }
          snackbar.enqueueSnackbar(`Appendix created successfully`);
          onClose(resp);
        } catch (err) {
          snackbar.enqueueSnackbar(`Error creating appendix: ${err}`);
        }
}    }, [project, template, onClose, snackbar]);

    return (
      <Dialog open={isOpen} onClose={() => onClose(null)}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
        <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Template</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={template}
          label="Template"
          onChange={handleTemplateChange}
        >
          {templateMenuOptions}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Project</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={project}
          label="Project"
          onChange={handleProjectChange}
        >
          {projectMenuOptions}
        </Select>
      </FormControl>

        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => onClose(null)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
          disabled={!template}
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
