import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';

type PathwayLegendRecord = {
  ident: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  format?: string;
  filename?: string;
  name?: string;
  data?: string;
  default?: boolean;
};

type AddEditPathwayLegendProps = {
  isOpen: boolean;
  editData?: PathwayLegendRecord | null;
  onClose: (newData?: PathwayLegendRecord) => void;
};

type LegendFormValues = {
  name: string;
  default: boolean;
};

// Single source of truth for accepted image extensions.
const ACCEPTED_IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'svg'] as const;
const ACCEPTED_ATTR = ACCEPTED_IMAGE_EXTS.map((ext) => `.${ext}`).join(',');
const ACCEPTED_EXT_RE = new RegExp(`\\.(${ACCEPTED_IMAGE_EXTS.join('|')})$`, 'i');

const DEFAULT_VALUES: LegendFormValues = {
  name: '',
  default: false,
};

const AddEditPathwayLegend = ({
  isOpen,
  editData = null,
  onClose,
}: AddEditPathwayLegendProps): JSX.Element => {
  const isEdit = Boolean(editData);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<LegendFormValues>({ defaultValues: DEFAULT_VALUES });

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  const watchedName = watch('name');

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      reset({
        name: editData.name ?? '',
        default: editData.default ?? false,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
    setFile(null);
    setFileError('');
  }, [isOpen, editData, reset]);

  const handleFileChange = useCallback((event: { target: HTMLInputElement }) => {
    const next = event.target.files?.[0];
    if (!next) return;
    if (!ACCEPTED_EXT_RE.test(next.name)) {
      setFileError(`Please select a valid image (${ACCEPTED_ATTR})`);
      setFile(null);
      return;
    }
    setFileError('');
    setFile(next);
  }, []);

  const previewSrc = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (editData?.data) {
      const fmt = editData.format ?? editData.filename?.split('.').pop() ?? 'png';
      const mime = fmt.toLowerCase() === 'svg' ? 'svg+xml' : fmt.toLowerCase();
      return editData.data.startsWith('data:')
        ? editData.data
        : `data:image/${mime};base64,${editData.data}`;
    }
    return '';
  }, [file, editData]);

  useEffect(() => () => {
    if (previewSrc.startsWith('blob:')) {
      URL.revokeObjectURL(previewSrc);
    }
  }, [previewSrc]);

  let fileButtonLabel = 'Choose Image';
  if (file) {
    fileButtonLabel = `Selected: ${file.name}`;
  } else if (isEdit) {
    fileButtonLabel = 'Replace Image';
  }

  const onSubmit: SubmitHandler<LegendFormValues> = useCallback(async (values) => {
    if (!isEdit && !file) {
      setFileError('Please choose an image');
      return;
    }
    try {
      const form = new FormData();
      const effectiveFilename = file?.name ?? editData?.filename ?? '';
      if (file) form.append('legend', file, effectiveFilename);
      form.append('name', values.name);
      form.append('default', String(values.default));

      const res = isEdit
        ? await api.put(`/legend/${editData.ident}`, form, {}, true).request() as PathwayLegendRecord
        : await api.post('/legend', form, {}, true).request() as PathwayLegendRecord;
      snackbar.success(`Pathway legend ${isEdit ? 'updated' : 'uploaded'} successfully`);
      onClose(res);
      reset(DEFAULT_VALUES);
      setFile(null);
    } catch (err) {
      snackbar.error(`Error ${isEdit ? 'updating' : 'uploading'} pathway legend: ${err}`);
    }
  }, [isEdit, file, editData, onClose, reset]);

  const handleCancel = useCallback(() => {
    reset(DEFAULT_VALUES);
    setFile(null);
    setFileError('');
    onClose();
  }, [onClose, reset]);

  return (
    <Dialog open={isOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Pathway Legend' : 'Upload Pathway Legend'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                required
                margin="normal"
                variant="outlined"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="default"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    color="secondary"
                  />
                )}
                label="Set as default legend"
              />
            )}
          />
          <Button
            component="label"
            variant="outlined"
            sx={{ mt: 2, display: 'block' }}
          >
            {fileButtonLabel}
            <input
              type="file"
              accept={ACCEPTED_ATTR}
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {fileError && (
            <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
              {fileError}
            </Typography>
          )}
          {previewSrc && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <img
                src={previewSrc}
                alt={watchedName || file?.name || editData?.filename || 'Pathway legend preview'}
                style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">Cancel</Button>
          <Button type="submit" color="secondary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEditPathwayLegend;
export type { PathwayLegendRecord };
