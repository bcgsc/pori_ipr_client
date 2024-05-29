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
  Divider,
  Typography,
} from '@mui/material';
import snackbar from '@/services/SnackbarUtils';

import api from '@/services/api';
import './index.scss';
import { MenuBar } from '@/components/IPRWYSIWYGEditor';
import {
  useEditor, EditorContent,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import sanitizeHtml from 'sanitize-html';
import {
  ProjectType, TemplateType,
} from '../../../../types';

type AddEditAppendixProps = {
  isOpen: boolean;
  onClose: (newData?: Record<string, unknown>) => void;
};

const extensions = [
  StarterKit,
  Underline,
];

const AddEditAppendix = ({
  isOpen,
  onClose,
}: AddEditAppendixProps): JSX.Element => {
  const [dialogTitle, setDialogTitle] = useState('');
  const [project, setProject] = useState<ProjectType>();
  const [projectOptions, setProjectOptions] = useState([]);
  const [template, setTemplate] = useState<TemplateType>();
  const [templateOptions, setTemplateOptions] = useState([]);
  const [templateSelected, setTemplateSelected] = useState<boolean>(false);

  const editor = useEditor({
    extensions,
  });

  // Grab project and groups
  useEffect(() => {
    setDialogTitle('Create Custom Template Appendix');
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
    if (template) {
      setTemplateSelected(true);
    } else {
      setTemplateSelected(false);
    }
  }, [template]);

  const handleSubmit = useCallback(async () => {
    try {
      const sanitizedText = sanitizeHtml(editor?.getHTML(), {
        allowedAttributes: {
          a: ['href', 'target', 'rel'],
        },
        transformTags: {
          a: (_tagName, attribs) => ({
            tagName: 'a',
            attribs: {
              href: attribs.href,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          }),
        },
      });
      let res;
      if (project) {
        res = await api.post(`/appendix?templateId=${template?.ident}&projectId=${project.ident}`, { text: sanitizedText }).request();
      } else {
        res = await api.post(`/appendix?templateId=${template?.ident}`, { text: sanitizedText }).request();
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
  }, [project, onClose, template?.ident, template?.name, editor]);

  return (
    <Dialog
      open={isOpen}
      maxWidth="md"
      fullWidth
      className="edit-dialog"
      onClose={() => onClose(null)}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <Divider><Typography variant="caption">Select template and project</Typography></Divider>
      <DialogContent>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <InputLabel id="template-select-label">Template</InputLabel>
          <Select
            variant="outlined"
            className="add-item__select-field"
            fullWidth
            required
            defaultValue=""
            id="template-select"
            label="Template"
            onChange={handleTemplateChange}
          >
            {templateOptions && (
              templateOptions.map((temp) => (
                <MenuItem
                  value={temp}
                  key={temp.name}
                  onChange={handleTemplateChange}
                >
                  {' '}
                  {temp.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <InputLabel id="projects-select-label">Project</InputLabel>
          <Select
            defaultValue=""
            id="projects-select"
            label="Project"
            variant="outlined"
            className="add-item__select-field"
            fullWidth
            required
            onChange={handleProjectChange}
          >
            {projectOptions && (
              projectOptions.map((proj) => (
                <MenuItem
                  value={proj}
                  key={proj.name}
                  onChange={handleProjectChange}
                >
                  {' '}
                  {proj.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </DialogContent>
      <Divider><Typography variant="caption">Add appendix text</Typography></Divider>
      <DialogContent>
        <MenuBar editor={editor} className="IPRWYSIWYGEditor__toolbar" />
        <EditorContent editor={editor} className="IPRWYSIWYGEditor__content" />
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
