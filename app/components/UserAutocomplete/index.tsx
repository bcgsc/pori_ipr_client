import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Button,
  Typography,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { useDebounce } from 'use-debounce';
import { useSnackbar } from 'notistack';
import api from '@/services/api';
import { UserType } from '@/common';

import './index.scss';
import { ArrowCircleRight } from '@mui/icons-material';

type UserAutocompleteProps = {
  defaultValue?: UserType;
  label: string;
  addEditUserDialog?: boolean;
  onSubmit?: (val: Partial<UserType>) => void;
  onSubmitProjects?: (val: Partial<UserType>) => void;
  onSubmitGroups?: (val: Partial<UserType>) => void;
  onChange?: (val: Partial<UserType>) => void;
};

const UserAutocomplete = ({
  defaultValue = null,
  label,
  addEditUserDialog = false,
  onSubmit = null,
  onSubmitProjects = null,
  onSubmitGroups = null,
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

  const handleSubmitProjects = useCallback(() => {
    onSubmitProjects(value);
  }, [onSubmitProjects, value]);

  const handleSubmitGroups = useCallback(() => {
    onSubmitGroups(value);
  }, [onSubmitGroups, value]);

  const handleSelectedValueChange = useCallback((_event, val) => {
    setValue(val);
    if (onChange) {
      onChange(val);
    }
  }, [onChange]);

  let buttonSection = (
    <Button onClick={handleSubmit}>
      <ArrowCircleRight />
    </Button>
  );

  if (addEditUserDialog) {
    buttonSection = (
      <>
        <Button onClick={handleSubmitProjects} color="inherit" variant="outlined" sx={{ padding: 1 }}>
          <FolderSharedIcon fontSize="small" />
          <Typography sx={{ fontSize: 10, paddingLeft: 0.5 }}>Copy Projects</Typography>
        </Button>
        <Button onClick={handleSubmitGroups} color="inherit" variant="outlined" sx={{ padding: 1, marginLeft: 1 }}>
          <PeopleIcon fontSize="small" />
          <Typography sx={{ fontSize: 10, paddingLeft: 0.5 }}>Copy Groups</Typography>
        </Button>
      </>
    );
  }

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
                  <div>{ buttonSection }</div>
                )}
              </>
            ),
            style: {
              padding: 9,
            },
          }}
        />
      )}
    />
  );
};

export default UserAutocomplete;
