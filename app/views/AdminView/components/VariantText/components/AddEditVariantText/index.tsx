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
  Chip,
  Autocomplete,
} from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
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
import { VariantTextType } from '@/common';

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
  const [isLoading, setIsLoading] = useState(false);
  const [projectOptions, setProjectOptions] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);

  const editor = useEditor({
    extensions,
  });

  // Grab project and groups
  useEffect(() => {
    let cancelled = false;
    const getData = async () => {
      setIsLoading(true);
      try {
        const [projectsResp, templatesResp] = await Promise.all([
          api.get('/project').request(),
          api.get('/templates').request(),
        ]);
        if (!cancelled) {
          setProjectOptions(projectsResp);
          setTemplateOptions(templatesResp);
        }
      } catch (e) {
        snackbar.error(`Error getting Project and Template options: ${e}`);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
    return function cleanup() { cancelled = true; };
  }, []);

  const {
    register, handleSubmit, formState: { dirtyFields }, setValue, getValues, reset, control,
  } = useForm<VariantTextType>({
    mode: 'onChange',
    defaultValues: {
      template: null,
      project: null,
      variantName: '',
      cancerType: [],
      text: '',
    },
  });

  const cancerTypeChips = useWatch(({ control, name: 'cancerType' }));

  const handlecancerTypesFieldKeyDown = useCallback(({ code, target: { value } }) => {
    if (code === 'Backspace' && !value) {
      // Delete the last entry
      const currData = getValues('cancerType');
      setValue('cancerType', currData.slice(0, -1), {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    if (code === 'Enter') {
      const nextEntry = value.trim();
      if (nextEntry) {
        const currData = getValues('cancerType');
        setValue('cancerType', [...currData, nextEntry], {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
  }, [getValues, setValue]);

  const handlecancerTypesDelete = useCallback((idx) => {
    const currData = getValues('cancerType');
    const nextData = [...currData];
    nextData.splice(idx, 1);
    setValue('cancerType', nextData, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [getValues, setValue]);

  const saveVariant = useCallback(async ({
    template: {
      ident: nextTemplateIdent,
    },
    project: {
      ident: nextProjectIdent,
    },
    variantName: nextVariantName,
    cancerType: nextCancerType,
  }) => {
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

      const res = await api.post('/variant-text', {
        template: nextTemplateIdent,
        project: nextProjectIdent,
        variantName: nextVariantName,
        cancerType: nextCancerType,
        text: sanitizedText,
      }).request();
      snackbar.success('Variant text record created successfully');
      const returnedData: VariantTextType = {
        ...res,
        template: getValues('template'),
        project: getValues('project'),
      };
      onClose(returnedData);
      editor.commands.clearContent();
      reset();
    } catch (err) {
      if (err.message && err.message.includes('[409]')) {
        let projectStr = '';
        const temp = getValues('template');
        const proj = getValues('project');
        if (proj) {
          projectStr = `and project ${proj.name}`;
        } else {
          projectStr = '(default variant text)';
        }
        snackbar.error(`Error creating variant text record: record already exists for pair: template ${temp.name} ${projectStr}`);
      } else {
        snackbar.error(`Error creating variant text reord: ${err}`);
      }
    }
  }, [editor, onClose, getValues, reset]);

  const disableSubmit = isLoading || Object.keys(dirtyFields).length === 0;

  const handleCancel = useCallback(() => {
    reset();
    editor.commands.clearContent();
    onClose(null);
  }, [editor?.commands, onClose, reset]);

  return (
    <Dialog
      open={isOpen}
      maxWidth="md"
      fullWidth
      className="variant-text__edit-dialog"
      onClose={() => onClose(null)}
    >
      <DialogTitle>Create Custom Variant Text</DialogTitle>
      <DialogContent>
        <Divider><Typography variant="caption">Add variant name and cancer type</Typography></Divider>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <TextField
            className="text-field"
            label="Variant Name"
            variant="outlined"
            fullWidth
            {...register('variantName', {
              required: true,
            })}
          />
          <Autocomplete
            className="text-field"
            fullWidth
            multiple
            options={[]}
            freeSolo
            disableClearable
            {...register('cancerType')}
            renderTags={() => cancerTypeChips.map((cT, idx) => (
              <Chip
                // eslint-disable-next-line react/no-array-index-key
                key={`${cT}-${idx}`}
                tabIndex={-1}
                label={`${cT}`}
                onDelete={() => handlecancerTypesDelete(idx)}
              />
            ))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cancer Types"
                name="species"
                helperText="Press enter to confirm new entry"
                onKeyDown={handlecancerTypesFieldKeyDown}
              />
            )}
          />
        </FormControl>
        <Divider><Typography variant="caption">Select template and project</Typography></Divider>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <InputLabel id="template-select-label" className="add-item__select-label">Template</InputLabel>
          <Select
            variant="outlined"
            className="add-item__select-field"
            fullWidth
            defaultValue=""
            id="template-select"
            label="Template"
            {...register('template', {
              required: true,
            })}
          >
            {templateOptions && (
              templateOptions.map((temp) => (
                <MenuItem
                  value={temp}
                  key={temp.name}
                >
                  {' '}
                  {temp.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <InputLabel id="projects-select-label" className="add-item__select-label">Project</InputLabel>
          <Select
            defaultValue=""
            id="projects-select"
            label="Project"
            variant="outlined"
            className="add-item__select-field"
            fullWidth
            {...register('project', {
              required: true,
            })}
          >
            {projectOptions && (
              projectOptions.map((proj) => (
                <MenuItem
                  value={proj}
                  key={proj.name}
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
          onClick={handleCancel}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          disabled={disableSubmit}
          onClick={handleSubmit(saveVariant)}
          color="secondary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditVariantText;
