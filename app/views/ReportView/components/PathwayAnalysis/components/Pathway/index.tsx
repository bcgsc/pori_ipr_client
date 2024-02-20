import React, {
  useEffect, useState, useContext, useCallback, useMemo,
} from 'react';
import { useSnackbar } from 'notistack';
import {
  IconButton,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';

import api from '@/services/api';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import SvgImage from '@/components/SvgImage';
import useReport from '@/hooks/useReport';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import PathwayImageType from '../../types';

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
      newPathway.set('legend', 'v2');

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
    }
  }, [initialPathway, isSigned, onChange, report, snackbar, showConfirmDialog]);

  const pathwayUpload = useMemo(() => {
    let component = null;
    if (canEdit && !isPrint) {
      component = (
        <Button
          className="pathway__legend-button"
          component="label"
          color="secondary"
          variant="outlined"
        >
          {!isPathwayLoading && (
          <>
            Upload Pathway Image
            <PublishIcon />
            <input
              accept=".svg"
              onChange={handlePathwayUpload}
              type="file"
              hidden
            />
          </>
          )}
          {isPathwayLoading && (
          <CircularProgress size="small" color="secondary" />
          )}
        </Button>
      );
      if (pathwayImage?.pathway) {
        component = (
          <IconButton
            className="pathway__button"
            color="secondary"
            component="label"
            size="large"
          >
            <PublishIcon />
            <input
              accept=".svg"
              onChange={handlePathwayUpload}
              type="file"
              hidden
            />
          </IconButton>
        );
      }
    }
    return component;
  }, [handlePathwayUpload, canEdit, isPrint, pathwayImage?.pathway, isPathwayLoading]);

  return (
    <div>
      {imageError && (
        <Typography align="center" color="error">{imageError}</Typography>
      )}
      {pathwayUpload}
      {pathwayImage?.pathway && (
        <SvgImage image={pathwayImage.pathway} isPrint={isPrint} />
      )}
      {!pathwayImage && (!canEdit || isPrint) && (
        <Typography align="center">Pathway Not Yet Analyzed</Typography>
      )}
    </div>
  );
};

export default Pathway;
