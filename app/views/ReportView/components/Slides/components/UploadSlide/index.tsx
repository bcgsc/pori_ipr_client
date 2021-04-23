import React, { useState, useCallback, useContext } from 'react';
import {
  Typography,
  Button,
  TextField,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';

import api from '@/services/api';
import ReportContext from '@/components/ReportContext';
import SlideType from '../../types';

import './index.scss';

const FILE_SIZE_LIMIT = 10000000;

type UploadSlideProps = {
  onUpload: (newData: SlideType) => void;
};

const UploadSlide = ({
  onUpload,
}: UploadSlideProps): JSX.Element => {
  const snackbar = useSnackbar();
  const { report } = useContext(ReportContext);

  const [slideName, setSlideName] = useState('');
  const [imageError, setImageError] = useState('');

  const handleSlideNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlideName(event.target.value);
  };

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    const [file] = files;
    if (!file?.name?.match(/\.(jpg|jpeg|png|gif)$/)) {
      setImageError('Please select a valid image (.jpg/.jpeg/.png/.gif)');
      return;
    }
    if (file?.size > FILE_SIZE_LIMIT) {
      setImageError('Please select an image < 10MB');
      return;
    }
    setImageError('');

    try {
      const newSlide = new FormData();

      newSlide.append('name', slideName);
      newSlide.append('file', file);

      const resp = await api.post(
        `/reports/${report.ident}/presentation/slide`,
        newSlide,
        {},
        true,
      ).request();
      snackbar.enqueueSnackbar('Slide uploaded successfully', { variant: 'success' });
      onUpload(resp);
    } catch (err) {
      snackbar.enqueueSnackbar(`Error uploading slide: ${err}`, { variant: 'error' });
    }
  }, [onUpload, slideName, snackbar, report]);

  return (
    <>
      <TextField
        className="text-field-fix"
        color="secondary"
        helperText="A slide name must be entered before a file can be selected (max 10MB)"
        label="Slide name"
        onChange={handleSlideNameChange}
        value={slideName}
        variant="outlined"
      />
      <Button
        className="upload__button"
        color="secondary"
        component="label"
        disabled={!slideName}
        variant="outlined"
      >
        Select File
        <input
          accept=".png,.jpeg,.jpg,.gif"
          data-testid="upload-slide__input"
          hidden
          onChange={handleImageUpload}
          type="file"
        />
      </Button>
      {imageError && (
        <Typography color="error" className="upload--error">
          {imageError}
        </Typography>
      )}
    </>
  );
};

export default UploadSlide;
