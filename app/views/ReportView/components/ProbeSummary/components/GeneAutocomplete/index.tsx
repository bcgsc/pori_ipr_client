import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  Autocomplete,
  TextField,
} from '@mui/material';
import { useDebounce } from 'use-debounce';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import { GeneType } from '@/common';
import { useSnackbar } from 'notistack';

type GeneAutocompleteProps = {
  value?: GeneType;
  onChange: (newData: GeneType) => void;
};

const GeneAutocomplete = ({
  value = null,
  onChange,
}: GeneAutocompleteProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<GeneType[]>([]);
  const [text, setText] = useState<string>(value?.name);
  const [debouncedText] = useDebounce(text, 500);
  const snackbar = useSnackbar();

  useEffect(() => {
    setText((prevVal) => {
      if (!value?.name) { return ''; }
      if (prevVal !== value?.name) { return value?.name; }
      return prevVal;
    });
  }, [value?.name]);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const genesResp = await api.get(`/reports/${report.ident}/genes/?search=${debouncedText}`).request();
        setOptions(genesResp);
      } catch (e) {
        snackbar.enqueueSnackbar('Error getting Genes for Report');
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [report, snackbar, debouncedText]);

  const handleAutocompleteChange = useCallback((_event, val) => {
    onChange(val);
  }, [onChange]);

  const handleTextChange = useCallback((evt) => {
    const nextText = evt?.target.value;
    setText((prevText) => (prevText === nextText ? prevText : nextText));
  }, []);

  return (
    <Autocomplete
      autoHighlight
      classes={{ root: 'autocomplete', popper: 'autocomplete__popper' }}
      onChange={handleAutocompleteChange}
      options={options}
      loading={isLoading}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(opt, val) => opt?.name === val?.name}
      value={value || null}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Gene"
          variant="outlined"
          margin="normal"
          onChange={handleTextChange}
        />
      )}
    />
  );
};

export default GeneAutocomplete;
