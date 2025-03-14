import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  CircularProgress,
  Autocomplete,
} from '@mui/material';

import api from '@/services/api';
import { debounce as debounceFn } from 'lodash';

type AutocompleteHandlerProps = {
  defaultValue: unknown;
  type: string;
  label: string;
  required?: boolean;
  onChange: (selectedValue: unknown, typeName: string) => void;
  error?: string;
  minCharacters?: number;
  /**
   * MS to wait before sending API request
   */
  debounce?: number;
};

const AutocompleteHandler = (props: AutocompleteHandlerProps) => {
  const {
    defaultValue = '',
    type,
    label,
    required = false,
    onChange = () => { },
    error = '',
    minCharacters = 1,
    debounce = 300,
  } = props;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [inputText, setInputText] = useState('');
  const debouncedSave = debounceFn((nextValue) => setInputText(nextValue), debounce);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => () => {
    debouncedSave.cancel();
  }, [debouncedSave]);

  const handleInputChange = useCallback((event) => {
    const queryString = event.target.value;
    debouncedSave(queryString);
  }, [debouncedSave]);

  useEffect(() => {
    const getAutoCompleteOptions = async () => {
      // Find all query strings that are 3 characters or longer.
      // Needed for KB API to process multiple words
      const nextQueryString = inputText.split(' ').filter((str) => str.length >= minCharacters).join(' ');
      const { result } = await api.get(`/graphkb/${type}?search=${nextQueryString}`).request();

      setOptions(result ?? []);
      setLoading(false);
    };
    if (inputText.length >= minCharacters) {
      setOptions([]);
      setLoading(true);
      getAutoCompleteOptions();
    }
  }, [inputText, minCharacters, type]);

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
