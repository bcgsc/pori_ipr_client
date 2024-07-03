import './index.scss';

import {
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useCallback, useEffect, useState } from 'react';

const MIN_WORD_LENGTH = 3;

const SearchView = () => {
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Calls submit function
  const handleSubmit = useCallback(() => {
    if (value) {
      let transformedVariant = `${value.replace(/:/, ' (')})`;
      transformedVariant = transformedVariant.replace(/\./, '%2F');
      window.location.href = `/search/${transformedVariant}`;
    } else {
      setErrorMessage('Please enter a key variant');
    }
  }, [value]);

  // Validate key variant value
  useEffect(() => {
    if (!value) {
      setErrorMessage('');
    } else {
      const trimmed = String(value)
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length >= MIN_WORD_LENGTH);

      if (!trimmed.length) {
        setErrorMessage(`Must have 1 or more terms of at least ${MIN_WORD_LENGTH} characters`);
      } else {
        setErrorMessage('');
      }
    }
  }, [value]);

  const handleInputChange = useCallback((event) => {
    const newValue = event.target.value;

    if (newValue !== value) {
      setValue(newValue);
    }
  }, [value]);

  return (
    <div className="search">
      <div className="search__bar">
        <div
          className="search__main"
          role="textbox"
          tabIndex={0}
        >
          <TextField
            variant="standard"
            error={Boolean(errorMessage)}
            fullWidth
            helperText={errorMessage}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={handleSubmit}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onChange={handleInputChange}
            placeholder="Search Reports by Key Variant"
            value={value}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchView;
