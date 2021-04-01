import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  TextField,
  Input,
} from '@material-ui/core';

import api from '@/services/api';

const UploadSlide = (): JSX.Element => {
  const [slideName, setSlideName] = useState('');

  const handleSlideNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlideName(event.target.value);
  };

  return (
    <div>
      <TextField
        className="text-field-fix"
        helperText="Slide name must be entered before a file can be selected"
        label="Slide name"
        onChange={handleSlideNameChange}
        value={slideName}
        variant="outlined"
      />
      <Button color="secondary" variant="contained" component="label">
        Upload
        <input accept="image/*" type="file" hidden />
      </Button>
    </div>
  );
};

export default UploadSlide;
