import React, { useState, useEffect, useCallback } from 'react';
import { Autocomplete } from '@material-ui/lab';
import {
  TextField,
  CircularProgress,
  Button,
} from '@material-ui/core';

import api from '../../services/api';
import { userType } from '../../common';

import './index.scss';

type UserAutocompleteProps = {
  defaultValue?: userType;
  label: string;
  onSubmit?: (val: userType) => void;
  onChange?: (val: userType) => void;
};

const UserAutocomplete = ({
  defaultValue,
  label,
  onSubmit,
  onChange,
}: UserAutocompleteProps): JSX.Element => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<userType>({
    email: '',
    firstName: '',
    groups: [],
    lastLogin: null,
    lastName: '',
    projects: [],
    type: '',
    username: '',
    ident: '',
    updatedAt: '',
    createdAt: '',
  });

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

  const handleSubmit = useCallback(() => {
    onSubmit(value);
  }, [onSubmit, value]);

  const handleSelectedValueChange = useCallback((event, val) => {
    setValue(val);
    if (onChange) {
      onChange(val);
    }
  }, [onChange]);

  return (
    <Autocomplete
      autoHighlight
      disableOpenOnFocus
      classes={{ root: 'autocomplete', popper: 'autocomplete__popper' }}
      onChange={handleSelectedValueChange}
      options={options}
      getOptionLabel={(option) => (option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : '')}
      value={value}
      renderInput={(params) => (
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
                {value && !onChange && (
                  <Button onClick={handleSubmit}>
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
