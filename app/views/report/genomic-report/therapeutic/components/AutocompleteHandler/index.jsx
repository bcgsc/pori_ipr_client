import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  TextField,
  CircularProgress,
} from '@material-ui/core';
import kbAutocomplete from '../../../../../../services/reports/kbAutocomplete';

/**
 * @param {object} props props
 * @param {string} defaultValue default text in input box
 * @param {string} type type used for API autocomplete
 * @param {string} label text box label text
 * @param {bool} required is this field required
 * @param {func} onChange callback when value is selected
 * @param {string} error form error text
 * @return {*} JSX
 */
function AutocompleteHandler(props) {
  const {
    defaultValue,
    type,
    label,
    required,
    onChange,
    error,
  } = props;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);
  
  const onInputChange = async (event) => {
    if (event.target.value.length > 2) {
      setOptions([]);
      setLoading(true);

      const autocompleted = await kbAutocomplete(type, event.target.value);

      setOptions(autocompleted);
      setLoading(false);
    }
  };

  const onAutocompleteChange = (event, val) => {
    setValue(val);
    onChange(val, type);
  };

  return (
    <Autocomplete
      autoHighlight
      disableOpenOnFocus
      onChange={onAutocompleteChange}
      options={options}
      getOptionLabel={option => option.displayName || option}
      value={value}
      noOptionsText="Input 3 characters for autocomplete"
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          margin="normal"
          required={required}
          onChange={onInputChange}
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
}

AutocompleteHandler.propTypes = {
  defaultValue: PropTypes.string,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  onChange: PropTypes.func,
};

AutocompleteHandler.defaultProps = {
  defaultValue: '',
  required: false,
  onChange: () => {},
};

export default AutocompleteHandler;
