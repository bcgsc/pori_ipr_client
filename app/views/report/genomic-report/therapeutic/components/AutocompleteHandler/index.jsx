import React, { useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  TextField,
  CircularProgress,
} from '@material-ui/core';
import kbAutocomplete from '../../../../../../services/reports/kbAutocomplete';

/**
 * 
 */
function AutocompleteHandler(props) {
  const {
    defaultValue,
    type,
    label,
  } = props;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const onInputChange = async (event, value) => {
    if (value.length > 2) {
      setOptions([]);
      setLoading(true);

      const token = localStorage.getItem(`ngStorage-${CONFIG.STORAGE.KEYCLOAK}`);
      const autocompleted = await kbAutocomplete(token, type, value);

      setOptions(autocompleted);
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      autoHighlight
      defaultValue={defaultValue}
      options={options}
      getOptionLabel={option => option.displayName || ''}
      onInputChange={(event, value) => onInputChange(event, value)}
      noOptionsText="Input 3 characters for autocomplete"
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          margin="normal"
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

export default AutocompleteHandler;
