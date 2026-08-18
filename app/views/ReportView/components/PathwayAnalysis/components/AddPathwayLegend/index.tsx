import React, {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import { ImageType } from '@/components/Image';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { useLegendAll } from '@/queries/get';

const LEGEND_IMAGE_KEY = 'pathwayAnalysis.legend';

type LegendRecord = {
  ident: string;
  name: string;
  data: string;
  format?: string;
  filename?: string;
};

type AddPathwayLegendProps = {
  isOpen: boolean;
  onClose: (savedLegend?: boolean) => void;
};

const ACCEPTED_IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'svg'] as const;
const ACCEPTED_ATTR = ACCEPTED_IMAGE_EXTS.map((ext) => `.${ext}`).join(',');
const ACCEPTED_EXT_RE = new RegExp(`\\.(${ACCEPTED_IMAGE_EXTS.join('|')})$`, 'i');

const mimeSubtype = (format?: string, filename?: string): string => {
  const ext = (format ?? filename?.split('.').pop() ?? 'png').toLowerCase();
  if (ext === 'svg') {
    return 'svg+xml';
  }
  if (ext === 'jpg') {
    return 'jpeg';
  }
  return ext;
};

const toDataUri = (data: string, format?: string, filename?: string): string => (
  data.startsWith('data:') ? data : `data:image/${mimeSubtype(format, filename)};base64,${data}`
);

// A selected global legend arrives as base64; the report image store expects a file.
const base64ToBlob = (base64: string, mime: string): Blob => {
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
};

const AddPathwayLegend = ({
  isOpen,
  onClose,
}: AddPathwayLegendProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();

  const { data: legends = [], isLoading: isLegendsLoading } = useLegendAll<LegendRecord[]>({
    enabled: isOpen,
    onError: () => snackbar.error('Failed to load existing legends'),
  });

  const [selectedIdent, setSelectedIdent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIdent('');
      setFile(null);
      setError('');
    }
  }, [isOpen]);

  const selectedLegend = useMemo(
    () => legends.find((l) => l.ident === selectedIdent) ?? null,
    [legends, selectedIdent],
  );

  const previewSrc = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    if (selectedLegend) {
      return toDataUri(selectedLegend.data, selectedLegend.format, selectedLegend.filename);
    }
    return '';
  }, [file, selectedLegend]);

  useEffect(() => () => {
    if (previewSrc.startsWith('blob:')) {
      URL.revokeObjectURL(previewSrc);
    }
  }, [previewSrc]);

  // Dropdown and custom upload are mutually exclusive — the latest choice wins.
  const handleSelectChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIdent(event.target.value);
    setFile(null);
    setError('');
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) {
      return;
    }
    if (!ACCEPTED_EXT_RE.test(next.name)) {
      setError(`Please select a valid image (${ACCEPTED_ATTR})`);
      return;
    }
    setFile(next);
    setSelectedIdent('');
    setError('');
  }, []);

  const handleCancel = useCallback(() => onClose(), [onClose]);

  const handleSave = useCallback(async () => {
    let uploadBlob: Blob | File;
    let filename: string;

    if (file) {
      uploadBlob = file;
      filename = file.name;
    } else if (selectedLegend) {
      const mime = `image/${mimeSubtype(selectedLegend.format, selectedLegend.filename)}`;
      uploadBlob = base64ToBlob(selectedLegend.data, mime);
      filename = selectedLegend.filename || `${selectedLegend.name}.png`;
    } else {
      setError('Select an existing legend or upload a custom image');
      return;
    }

    const form = new FormData();
    form.append(LEGEND_IMAGE_KEY, uploadBlob, filename);

    const useFile = Boolean(file);
    let confirmCall;
    if (useFile) {
      confirmCall = api.post('/legend', form, {}, true);
    } else {
      confirmCall = api.put(`/reports/${report.ident}/summary/pathway-analysis/`, {
        legendIdent: selectedLegend.ident,
      }, {});
    }

    if (isSigned) {
      // Modifying a signed report drops signatures — defer to the confirm flow,
      // which runs the calls and reloads on confirmation. The save is a dependent
      // chain (the second call needs legendId from the first), so it is passed as
      // a function; nothing runs unless the user confirms.
      showConfirmDialog(async () => {
        const confirmResp = await confirmCall.request();
        return api.put(`/reports/${report.ident}/summary/pathway-analysis`, {
          legendId: confirmResp[0].legendId,
        }, {}).request();
      });
      return;
    }

    try {
      setIsSaving(true);
      const confirmResp = await confirmCall.request();

      if (useFile) {
        const newLegendId = confirmResp[0].legendId;
        await api.put(`/reports/${report.ident}/summary/pathway-analysis`, {
          legendId: newLegendId,
        }, {}).request();
        snackbar.success('Pathway legend saved');
        onClose(true);
      } else {
        snackbar.success('Pathway legend updated');
        onClose(true);
      }
    } catch (err) {
      snackbar.error(`Error saving pathway legend: ${err}`);
    } finally {
      setIsSaving(false);
    }
  }, [file, selectedLegend, report, isSigned, showConfirmDialog, onClose]);

  return (
    <Dialog open={isOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Custom Legend</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Select an existing legend"
          value={selectedIdent}
          onChange={handleSelectChange}
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLegendsLoading}
          helperText={isLegendsLoading ? 'Loading legends…' : ' '}
        >
          {legends.map((legend) => (
            <MenuItem key={legend.ident} value={legend.ident}>
              {legend.name}
            </MenuItem>
          ))}
        </TextField>

        <Divider sx={{ my: 1 }}>or</Divider>

        <Button component="label" variant="outlined" sx={{ display: 'block' }}>
          {file ? `Selected: ${file.name}` : 'Upload custom image'}
          <input type="file" accept={ACCEPTED_ATTR} hidden onChange={handleFileChange} />
        </Button>

        {error && (
          <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        {previewSrc && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <img
              src={previewSrc}
              alt="Pathway legend preview"
              style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">Cancel</Button>
        <Button
          onClick={handleSave}
          color="secondary"
          disabled={isSaving || (!file && !selectedLegend)}
        >
          {isSaving ? <CircularProgress size={20} color="secondary" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPathwayLegend;
export { LEGEND_IMAGE_KEY };
export type { LegendRecord };
