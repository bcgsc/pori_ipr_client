import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Button,
} from '@mui/material';
import { useDebounce } from 'use-debounce';
import { useSnackbar } from 'notistack';
import api from '@/services/api';
import { UserType } from '@/common';

import './index.scss';

type UserAutocompleteProps = {
  defaultValue?: UserType;
  label: string;
  onSubmit?: (val: Partial<UserType>) => void;
  onChange?: (val: Partial<UserType>) => void;
};

const UserAutocomplete = ({
  defaultValue = null,
  label,
  onSubmit = null,
  onChange = null,
}: UserAutocompleteProps): JSX.Element => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<Partial<UserType>>(null);
  const [text, setText] = useState<string>((value ? `${value.firstName} ${value.lastName}` : '') || '');
  const [debouncedText] = useDebounce(text, 500);
  const snackbar = useSnackbar();

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    setText((prevVal) => {
      if (!value?.firstName) { return ''; }
      if (prevVal !== `${value.firstName} ${value.lastName}`) {
        return `${value.firstName} ${value.lastName}`;
      }
      return prevVal;
    });
  }, [value?.firstName, value?.lastName]);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const autocompleted = await api.get(`/user/search?query=${debouncedText}`, {}).request();
        setOptions(autocompleted);
      } catch (e) {
        snackbar.enqueueSnackbar('Error getting user autocomplete data');
      } finally {
        setLoading(false);
      }
    };
    if (debouncedText) {
      getData();
    }
  }, [snackbar, debouncedText]);

  const handleTextChange = async ({ target: { value: nextText } }) => {
    setText((prevText) => (prevText === nextText ? prevText : nextText));
  };

  const handleSubmit = useCallback(() => {
    onSubmit(value);
  }, [onSubmit, value]);

  const handleSelectedValueChange = useCallback((_event, val) => {
    setValue(val);
    if (onChange) {
      onChange(val);
    }
  }, [onChange]);

  return (
    <Autocomplete
      autoHighlight
      classes={{ root: 'autocomplete', popper: 'autocomplete__popper' }}
      onChange={handleSelectedValueChange}
      options={options}
      getOptionLabel={(option) => (option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : '')}
      value={value}
      renderInput={(params) => (
        <TextField
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...params}
          label={label || 'User'}
          variant="outlined"
          margin="normal"
          onChange={handleTextChange}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {value && !onChange && (
                  <Button onClick={handleSubmit}>
                    Add
                  </Button>
                )}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default UserAutocomplete;
