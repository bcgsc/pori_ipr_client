import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import { useSnackbar } from 'notistack';
import {
  Typography,
  Button,
} from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';

import api from '@/services/api';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import SvgImage from '@/components/SvgImage';
import useReport from '@/hooks/useReport';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import PathwayImageType from '../../types';
import PreviewBox from '../PreviewBox';

type PathwayProps = {
  initialPathway: PathwayImageType | null;
  isPrint?: boolean;
  onChange: (newPathwayImage: PathwayImageType) => void;
};

const Pathway = ({
  initialPathway,
  isPrint = false,
  onChange,
}: PathwayProps): JSX.Element => {
  const { isSigned } = useContext(ConfirmContext);
  const { report } = useContext(ReportContext);
  const { canEdit } = useReport();
  const { showConfirmDialog } = useConfirmDialog();
  const snackbar = useSnackbar();

  const [pathwayImage, setPathwayImage] = useState<PathwayImageType>();
  const [isPathwayLoading, setIsPathwayLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (initialPathway) {
      setPathwayImage(initialPathway);
    }
  }, [initialPathway]);

  const handlePathwayUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    const [uploadedFile] = files;
    if (!uploadedFile.name.match(/\.svg$/)) {
      setImageError('Please select a valid image (.svg)');
      return;
    }
    setIsPathwayLoading(true);
    setImageError('');

    try {
      const newPathway = new FormData();

      newPathway.append('pathway', uploadedFile);

      let pathwayCall;

      if (initialPathway) {
        pathwayCall = api.put(
          `/reports/${report.ident}/summary/pathway-analysis`,
          newPathway,
          {},
          true,
        );
      } else {
        pathwayCall = api.post(
          `/reports/${report.ident}/summary/pathway-analysis`,
          newPathway,
          {},
          true,
        );
      }

      if (isSigned) {
        showConfirmDialog(pathwayCall);
      } else {
        const pathwayResp = await pathwayCall.request();
        setPathwayImage(pathwayResp);
        setIsPathwayLoading(false);
        onChange(pathwayResp);
        snackbar.enqueueSnackbar('Pathway image uploaded successfully', { variant: 'success' });
      }
    } catch (err) {
      snackbar.enqueueSnackbar(`Error uploading pathway image: ${err}`, { variant: 'error' });
      setIsPathwayLoading(false);
    }
  }, [initialPathway, isSigned, onChange, report, snackbar, showConfirmDialog]);

  let previewNode: JSX.Element;
  if (pathwayImage?.pathway && isPrint) {
    previewNode = <SvgImage image={pathwayImage.pathway} isPrint />;
  } else if (pathwayImage?.pathway) {
    previewNode = (
      <PreviewBox variant="filled" scrollable>
        <div style={{ width: '100%' }}>
          <SvgImage image={pathwayImage.pathway} />
        </div>
      </PreviewBox>
    );
  } else if (isPrint) {
    previewNode = <Typography align="center">Pathway Not Yet Analyzed</Typography>;
  } else {
    previewNode = (
      <PreviewBox variant="empty">
        <Typography align="center" color="text.secondary">
          {canEdit ? 'No pathway image' : 'Pathway Not Yet Analyzed'}
        </Typography>
      </PreviewBox>
    );
  }

  return (
    <div>
      {imageError && (
        <Typography align="center" color="error">{imageError}</Typography>
      )}
      {previewNode}
      {canEdit && !isPrint && (
        <Button
          component="label"
          color="secondary"
          variant="outlined"
          startIcon={<PublishIcon />}
          disabled={isPathwayLoading}
          sx={{ mt: 2 }}
        >
          {isPathwayLoading ? 'Uploading…' : 'Upload Pathway Image'}
          <input
            accept=".svg"
            onChange={handlePathwayUpload}
            type="file"
            hidden
          />
        </Button>
      )}
    </div>
  );
};

export default Pathway;
