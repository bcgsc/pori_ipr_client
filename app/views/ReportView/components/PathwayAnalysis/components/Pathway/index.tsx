import React, {
  useEffect, useState, useContext, useCallback,
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
import SvgImage from '@/components/SvgImage';
import useEdit from '@/hooks/useEdit';
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
  const { canEdit } = useEdit();
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

      let pathwayResp: PathwayImageType;
      if (initialPathway) {
        pathwayResp = await api.put(
          `/reports/${report.ident}/summary/pathway-analysis`,
          newPathway,
          {},
          true,
        ).request(isSigned);
      } else {
        pathwayResp = await api.post(
          `/reports/${report.ident}/summary/pathway-analysis`,
          newPathway,
          {},
          true,
        ).request(isSigned);
      }

      setPathwayImage(pathwayResp);
      setIsPathwayLoading(false);
      onChange(pathwayResp);
      snackbar.enqueueSnackbar('Pathway image uploaded successfully', { variant: 'success' });
    } catch (err) {
      snackbar.enqueueSnackbar(`Error uploading pathway image: ${err}`, { variant: 'error' });
    }
  }, [initialPathway, isSigned, onChange, report, snackbar]);

  return (
    <div>
      {imageError && (
        <Typography align="center" color="error">{imageError}</Typography>
      )}
      {canEdit && !isPrint && (
        <>
          {pathwayImage?.pathway ? (
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
          ) : (
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
          )}
        </>
      )}
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
