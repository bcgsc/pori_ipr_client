import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  CircularProgress,
  Autocomplete,
} from '@mui/material';

import api from '@/services/api';

type AutocompleteHandlerProps = {
  defaultValue: unknown;
  type: string;
  label: string;
  required?: boolean;
  onChange: (selectedValue: unknown, typeName: string) => void;
  error?: string;
  minCharacters?: number;
};

const AutocompleteHandler = (props: AutocompleteHandlerProps) => {
  const {
    defaultValue = '',
    type,
    label,
    required = false,
    onChange = () => { },
    error = '',
    minCharacters = 3,
  } = props;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = async (event) => {
    let queryString = event.target.value;

    if (queryString.length >= minCharacters) {
      setOptions([]);
      setLoading(true);

      // Find all query strings that are 3 characters or longer.
      // Needed for KB API to process multiple words
      queryString = queryString.split(' ').filter((str) => str.length >= minCharacters).join(' ');
      const { result } = await api.get(`/graphkb/${type}?search=${queryString}`).request();

      setOptions(result ?? []);
      setLoading(false);
    }
  };

  const handleAutocompleteChange = useCallback((_event, val) => {
    setValue(val);
    onChange(val, type);
  }, [onChange, type]);

  return (
    <Autocomplete
      autoHighlight
      classes={{ popper: 'autocomplete__popper' }}
      onChange={handleAutocompleteChange}
      options={options}
      getOptionLabel={(option) => option.displayName || option}
      value={value}
      noOptionsText={`Input ${minCharacters} character${minCharacters > 1 ? 's' : ''} for autocomplete`}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          margin="normal"
          required={required}
          onChange={handleInputChange}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              loading ? <CircularProgress color="inherit" size={20} /> : null
            ),
          }}
        />
      )}
    />
  );
};

export {
  AutocompleteHandler,
};

export default AutocompleteHandler;
