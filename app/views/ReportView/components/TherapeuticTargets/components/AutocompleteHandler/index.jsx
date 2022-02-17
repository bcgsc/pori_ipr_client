import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete } from '@mui/material';
import {
  TextField,
  CircularProgress,
} from '@mui/material';

import api from '@/services/api';

/**
 * @param {object} props props
 * @param {string} defaultValue default text in input box
 * @param {string} type type used for API autocomplete
 * @param {string} label text box label text
 * @param {bool} required is this field required
 * @param {func} onChange callback when value is selected
 * @param {string} error form error text
 * @param {number} minCharacters minimum amount of characters to hit API endpoint
 * @return {*} JSX
 */
const AutocompleteHandler = (props) => {
  const {
    defaultValue,
    type,
    label,
    required,
    onChange,
    error,
    minCharacters,
  } = props;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');

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
      queryString = queryString.split(' ').filter(str => str.length >= minCharacters).join(' ');
      const { result } = await api.get(`/graphkb/${type}?search=${queryString}`).request();

      setOptions(result);
      setLoading(false);
    }
  };

  const handleAutocompleteChange = useCallback((event, val) => {
    setValue(val);
    onChange(val, type);
  }, [onChange, type]);

  return (
    <Autocomplete
      autoHighlight
      disableOpenOnFocus
      classes={{ popper: 'autocomplete__popper' }}
      onChange={handleAutocompleteChange}
      options={options}
      getOptionLabel={option => option.displayName || option}
      value={value}
      noOptionsText={`Input ${minCharacters} character${minCharacters > 1 ? 's' : ''} for autocomplete`}
      renderInput={params => (
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
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

AutocompleteHandler.propTypes = {
  defaultValue: PropTypes.string,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  onChange: PropTypes.func,
  minCharacters: PropTypes.number,
};

AutocompleteHandler.defaultProps = {
  defaultValue: '',
  required: false,
  onChange: () => { },
  minCharacters: 3,
};

export default AutocompleteHandler;
