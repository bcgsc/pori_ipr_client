import React, { useState, useCallback, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Button,
} from '@mui/material';
import { ReportType } from '@/context/ReportContext';
import api from '../../services/api';

import './index.scss';

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

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = async ({ target: { value: queryValue } }) => {
    setLoading(true);
    const autocompleted = await api.get(`/reports?searchText=${queryValue}`, {}).request();

    setOptions(autocompleted.reports);
    setLoading(false);
  };

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
          onChange={handleInputChange}
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
