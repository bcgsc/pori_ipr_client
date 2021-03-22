import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import { useSnackbar } from 'notistack';
import {
  IconButton,
  Typography,
} from '@material-ui/core';
import PublishIcon from '@material-ui/icons/Publish';

import api from '@/services/api';
import AsyncButton from '@/components/AsyncButton';
import SvgImage from '@/components/SvgImage';
import EditContext from '@/components/EditContext';
import ReportContext from '@/components/ReportContext';
import ConfirmContext from '@/components/ConfirmContext';
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
  const { canEdit } = useContext(EditContext);
  const { isSigned } = useContext(ConfirmContext);
  const { report } = useContext(ReportContext);
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

      const pathwayResp = await api.put(
        `/reports/${report.ident}/summary/pathway-analysis`,
        newPathway,
        {},
        true,
      ).request(isSigned);
      
      setPathwayImage(pathwayResp);
      setIsPathwayLoading(false);
      onChange(pathwayResp);
      snackbar.enqueueSnackbar('Pathway image uploaded successfully', { variant: 'success' });
    } catch (err) {
      snackbar.enqueueSnackbar(`Error uploading pathway image: ${err}`, { variant: 'error' });
    }
  }, [isSigned, onChange, report, snackbar]);

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
            <AsyncButton
              className="pathway__legend-button"
              component="label"
              color="secondary"
              isLoading={isPathwayLoading}
              variant="outlined"
            >
              Upload Pathway Image
              <PublishIcon />
              <input
                accept=".svg"
                onChange={handlePathwayUpload}
                type="file"
                hidden
              />
            </AsyncButton>
          )}
        </>
      )}
      {pathwayImage?.pathway && (
        <SvgImage image={pathwayImage.pathway} isPrint={isPrint} />
      )}
      {!pathwayImage && !canEdit && (
        <Typography variant="h5" align="center">Pathway Not Yet Analyzed</Typography>
      )}
    </div>
  );
};

export default Pathway;
