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
import { useForm, Controller } from 'react-hook-form';
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
  editData?: VariantTextType;
  isOpen: boolean;
  onClose: (newData?: VariantTextType) => void;
};

type AddEditVariantFormProps = Omit<VariantTextType, 'project' | 'template'> & {
  template: string;
  project: string
};

const extensions = [
  StarterKit,
  Underline,
];

const AddEditVariantText = ({
  editData = null,
  isOpen,
  onClose,
}: AddEditVariantTextProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectOptions, setProjectOptions] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [isEditorDirty, setIsEditorDirty] = useState(false);

  const {
    register, handleSubmit, formState: { dirtyFields }, setValue, getValues, reset, control,
  } = useForm<AddEditVariantFormProps>({
    mode: 'onChange',
    defaultValues: {
      cancerType: [],
      project: '',
      template: '',
      variantName: '',
    },
  });

  const editor = useEditor({
    extensions,
    onUpdate: () => setIsEditorDirty(true),
  });

  useEffect(() => {
    if (editData) {
      reset({
        cancerType: editData.cancerType,
        template: editData.template.ident,
        project: editData.project.ident,
        variantName: editData.variantName,
      });
      editor.commands.setContent(editData.text);
    }
  }, [editor, reset, editData]);

  // Grab project and group options
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
    template,
    project,
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

      let call = api.post('/variant-text', {
        template,
        project,
        variantName: nextVariantName,
        cancerType: nextCancerType,
        text: sanitizedText,
      });
      let successText = 'Variant text record created successfully';

      if (editData) {
        call = api.put(`/variant-text/${editData.ident}`, {
          cancerType: nextCancerType,
          text: sanitizedText,
        });
        successText = 'Variant text record modified successfully';
      }

      const res = await call.request();
      snackbar.success(successText);
      const returnedData = {
        ...res,
        template: templateOptions.find(({ ident }) => ident === template),
        project: projectOptions.find(({ ident }) => ident === project),
      };
      onClose(returnedData);
      editor.commands.clearContent();
      reset();
    } catch (err) {
      if (err.message && err.message.includes('[409]')) {
        let projectStr = '';
        const tempId = getValues('template');
        const projId = getValues('project');
        const temp = templateOptions.find(({ ident }) => ident === tempId);
        const proj = projectOptions.find(({ ident }) => ident === projId);
        if (proj) {
          projectStr = `and project ${proj.name}`;
        } else {
          projectStr = '(default variant text)';
        }
        snackbar.error(`Error creating variant text record: record already exists for pair: template ${temp.name} ${projectStr}`);
      } else {
        snackbar.error(`Error ${editData ? 'modifying' : 'creating'} variant text reord: ${err}`);
      }
    }
  }, [editor, editData, templateOptions, projectOptions, onClose, reset, getValues]);

  const disableSubmit = isLoading || (Object.keys(dirtyFields).length === 0 && !isEditorDirty);

  const handleCancel = useCallback(() => {
    reset();
    if (editData) {
      editor.commands.setContent(editData.text);
    } else {
      editor.commands.clearContent();
    }
    onClose(null);
  }, [editor, editData, onClose, reset]);

  return (
    <Dialog
      open={isOpen}
      maxWidth="md"
      fullWidth
      className="variant-text__edit-dialog"
      onClose={handleCancel}
    >
      <DialogTitle>Create Custom Variant Text</DialogTitle>
      <DialogContent>
        <Divider><Typography variant="caption">Add variant name and cancer type</Typography></Divider>
        <FormControl fullWidth classes={{ root: 'add-item__form-container' }} variant="outlined">
          <TextField
            className="text-field"
            label="Variant Name"
            variant="outlined"
            disabled={Boolean(editData)}
            fullWidth
            {...register('variantName', {
              required: true,
            })}
          />
          <Controller
            control={control}
            name="cancerType"
            render={({
              field: { value, ref },
            }) => (
              <Autocomplete
                className="text-field"
                fullWidth
                multiple
                options={[]}
                freeSolo
                disableClearable
                value={value}
                renderTags={(values) => values.map((cT, idx) => (
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
                    inputRef={ref}
                    label="Cancer Types"
                    helperText="Press enter to confirm new entry"
                    onKeyDown={handlecancerTypesFieldKeyDown}
                  />
                )}
              />
            )}
          />
        </FormControl>
        <Divider><Typography variant="caption">Select template and project</Typography></Divider>
        <Controller
          control={control}
          name="template"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth classes={{ root: 'add-item__form-container' }}>
              <InputLabel id="template-select-label" className="add-item__select-label">Template</InputLabel>
              <Select
                className="add-item__select-field"
                disabled={Boolean(editData)}
                label="Template"
                labelId="template-select-label"
                fullWidth
                onChange={onChange}
                value={value}
                variant="outlined"
              >
                {templateOptions && (
                  templateOptions.map((temp) => (
                    <MenuItem
                      value={temp.ident}
                      key={temp.name}
                    >
                      {temp.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="project"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth classes={{ root: 'add-item__form-container' }}>
              <InputLabel id="projects-select-label" className="add-item__select-label">Project</InputLabel>
              <Select
                className="add-item__select-field"
                disabled={Boolean(editData)}
                fullWidth
                id="projects-select"
                label="Project"
                labelId="projects-select-label"
                onChange={onChange}
                value={value}
                variant="outlined"
              >
                {projectOptions && (
                  projectOptions.map((proj) => (
                    <MenuItem
                      value={proj.ident}
                      key={proj.name}
                    >
                      {proj.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        />
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
