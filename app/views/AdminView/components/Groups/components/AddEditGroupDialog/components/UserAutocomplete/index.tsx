import React, { useState, useCallback, useEffect } from 'react';
import { Autocomplete } from '@material-ui/lab';
import {
  TextField,
  CircularProgress,
} from '@material-ui/core';

import api from '../../../../../../../../services/api';

import './index.scss';

const UserAutocomplete = ({
  defaultValue,
  onChange,
}): JSX.Element => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState({});

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = async ({ target: { value: queryValue } }) => {
    setLoading(true);
    const autocompleted = await api.get(`/user/search?query=${queryValue}`, {}).request();

    setOptions(autocompleted);
    setLoading(false);
  };

  const handleAutocompleteChange = useCallback((event, val) => {
    setValue(val);
    onChange(val);
  }, [onChange]);

  return (
    <Autocomplete
      autoHighlight
      disableOpenOnFocus
      classes={{ root: 'autocomplete', popper: 'autocomplete__popper' }}
      onChange={handleAutocompleteChange}
      options={options}
      getOptionLabel={option => `${option.firstName} ${option.lastName}` || option}
      value={value}
      renderInput={params => (
        <TextField
          {...params}
          label="Group owner"
          variant="outlined"
          margin="normal"
          required
          onChange={handleInputChange}
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

export default UserAutocomplete;
