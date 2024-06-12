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
  TextField,
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
import { VariantTextType, TemplateType } from '@/common';
import { ProjectType } from '../../../../types';

type AddEditVariantTextProps = {
  isOpen: boolean;
  onClose: (newData?: VariantTextType) => void;
};

const extensions = [
  StarterKit,
  Underline,
];

const AddEditVariantText = ({
  isOpen,
  onClose,
}: AddEditVariantTextProps): JSX.Element => {
  const [dialogTitle, setDialogTitle] = useState('');
  const [project, setProject] = useState<ProjectType>();
  const [projectOptions, setProjectOptions] = useState([]);
  const [template, setTemplate] = useState<TemplateType>();
  const [templateOptions, setTemplateOptions] = useState([]);
  const [templateSelected, setTemplateSelected] = useState<boolean>(false);
  const [variantName, setVariantName] = useState<string>('');
  const [cancerType, setCancerType] = useState<string>('');

  const editor = useEditor({
    extensions,
  });

  // Grab project and groups
  useEffect(() => {
    setDialogTitle('Create Custom Variant Text');
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

  const handleVariantNameChange = (event) => {
    setVariantName(event.target.value);
  };

  const handleCancerTypeChange = (event) => {
    setCancerType(event.target.value);
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
        res = await api.post('/variant-text', {
          template: template?.ident, project: project.ident, variantName, cancerType, text: sanitizedText,
        }).request();
      } else {
        res = await api.post('/variant-text', {
          template: template?.ident, variantName, cancerType, text: sanitizedText,
        }).request();
      }
      snackbar.success('Variant text record created successfully');
      const returnedData: VariantTextType = {
        ...res,
        template,
        project,
      };
      onClose(returnedData);
      setTemplate(null);
      setProject(null);
    } catch (err) {
      if (err.message && err.message.includes('[409]')) {
        let projectStr = '';
        if (project) {
          projectStr = `and project ${project.name}`;
        } else {
          projectStr = '(default variant text)';
        }
        snackbar.error(`Error creating variant text record: record already exists for pair: template ${template.name} ${projectStr}`);
      } else {
        snackbar.error(`Error creating variant text reord: ${err}`);
      }
    }
  }, [editor, project, template, cancerType, variantName, onClose]);

  return (
    <Dialog
      open={isOpen}
      maxWidth="md"
      fullWidth
      className="variant-text__edit-dialog"
      onClose={() => onClose(null)}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <TextField
            className="text-field"
            label="Variant Name"
            onChange={handleVariantNameChange}
            variant="outlined"
            fullWidth
          />
          <TextField
            className="text-field"
            label="Cancer Type"
            onChange={handleCancerTypeChange}
            variant="outlined"
            fullWidth
          />
        </FormControl>
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
        <Divider><Typography variant="caption">Add variant text</Typography></Divider>
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

export default AddEditVariantText;
