import React, { useState, useCallback, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Button,
} from '@mui/material';
import { ReportType } from '@/context/ReportContext';

import './index.scss';
import { useDebounce } from 'use-debounce';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

type ReportAutocompleteProps = {
  defaultValue?: ReportType;
  onSubmit: (report: Record<string, unknown>) => void;
  label: string;
};

const ReportAutocomplete = ({
  defaultValue,
  onSubmit,
  label = '',
}: ReportAutocompleteProps): JSX.Element => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<ReportType>(null);
  const [text, setText] = useState<string>(defaultValue?.patientId || '');
  const [debouncedText] = useDebounce(text, 500);
  const snackbar = useSnackbar();

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    setText((prevVal) => {
      if (!value?.patientId) { return ''; }
      if (prevVal !== value?.patientId) { return value?.patientId; }
      return prevVal;
    });
  }, [value?.patientId]);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const reportsResp = await api.get(`/reports?searchText=${debouncedText}`).request();
        setOptions(reportsResp.reports);
      } catch (e) {
        snackbar.enqueueSnackbar('Error getting report autocomplete data');
      } finally {
        setLoading(false);
      }
    };
    if (debouncedText) {
      getData();
    }
  }, [snackbar, debouncedText]);

  const handleTextChange = useCallback(({ target: { value: nextText } }) => {
    setText((prevText) => (prevText === nextText ? prevText : nextText));
  }, []);

  const handleSubmit = useCallback(async () => {
    onSubmit(value);
  }, [value, onSubmit]);

  return (
    <Autocomplete
      autoHighlight
      classes={{ root: 'autocomplete', popper: 'autocomplete__popper' }}
      onChange={(_event, val) => setValue(val)}
      options={options}
      getOptionLabel={(option) => (option.patientId ? `${option.patientId} (${option.ident})` : '')}
      value={value}
      renderInput={(params) => (
        <TextField
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...params}
          label={label || 'Report'}
          variant="outlined"
          margin="normal"
          onChange={handleTextChange}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {value && (
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

export default ReportAutocomplete;
