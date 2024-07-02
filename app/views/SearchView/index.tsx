import './index.scss';

import {
  IconButton,
  InputAdornment,
  TextField,
} from  '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useCallback, useEffect, useState } from 'react';

const SearchByVariant = () => {
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Calls submit function for currently active tab.
   */
  const handleSubmit = useCallback(() => {
    if (value) {
        window.open(`/reports/search/${value.replace(/^#/, '')}`, '');
      } 
    }, [value]);

  // validate
  useEffect(() => {
    if (!value) {
      setErrorMessage('');
    } else {
      try {
        setErrorMessage('');
      } catch (err) {
          setErrorMessage(`${err || err.message}`);
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
            error={Boolean(errorMessage)}
            fullWidth
            helperText={errorMessage}
            InputProps={{
              endAdornment: (
                <InputAdornment>
                  <IconButton color="primary" onClick={handleSubmit}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onChange={handleInputChange}
            placeholder='Search Reports by Key Variant'
            value={value}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchByVariant;
