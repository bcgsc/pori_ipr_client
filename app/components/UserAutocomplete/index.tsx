import React, { useState, useEffect, useCallback } from 'react';
import { Autocomplete } from '@material-ui/lab';
import {
  TextField,
  CircularProgress,
  Button,
} from '@material-ui/core';

import api from '../../services/api';

import './index.scss';

type props = {
  defaultValue?: Record<string, unknown>,
  label: string,
  onSubmit: (val: Record<string, unknown>) => void,
}

const UserAutocomplete = ({
  defaultValue,
  onSubmit,
  label,
}:props): JSX.Element => {
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

  const submit = useCallback(() => {
    onSubmit(value);
  }, [onSubmit, value]);

  return (
    <Autocomplete
      autoHighlight
      disableOpenOnFocus
      classes={{ root: 'autocomplete', popper: 'autocomplete__popper' }}
      onChange={(event, val) => setValue(val)}
      options={options}
      getOptionLabel={option => (option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : '')}
      value={value}
      renderInput={params => (
        <TextField
          {...params}
          label={label || 'User'}
          variant="outlined"
          margin="normal"
          onChange={handleInputChange}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {value && (
                  <Button onClick={submit}>
                    Add
                  </Button>
                )}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default UserAutocomplete;
