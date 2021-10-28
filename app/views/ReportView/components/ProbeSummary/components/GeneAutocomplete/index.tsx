import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import { Autocomplete } from '@material-ui/lab';
import {
  TextField,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import { GeneType } from '@/common';

type GeneAutocompleteProps = {
  defaultValue?: GeneType;
  onChange: (newData: GeneType) => void;
};

const GeneAutocomplete = ({
  defaultValue = null,
  onChange,
}: GeneAutocompleteProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [options, setOptions] = useState<GeneType[]>([]);
  const [value, setValue] = useState<GeneType>();
  const [genes, setGenes] = useState<GeneType[]>([]);

  useEffect(() => {
    const getData = async () => {
      const genesResp = await api.get<GeneType[]>(`/reports/${report.ident}/genes`).request();
      setGenes(genesResp);
      setOptions(genesResp);
    };
    getData();
  }, [report]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = useCallback(async ({ target: { value: queryValue } }) => {
    if (queryValue) {
      setOptions(genes.filter((gene) => (
        gene.name.toLowerCase().includes(queryValue.toLowerCase())
      )));
    } else {
      setOptions(genes);
    }
  }, [genes]);

  const handleAutocompleteChange = useCallback((event, val) => {
    if (val === null) {
      setOptions(genes);
    }
    setValue(val);
    onChange(val);
  }, [onChange, genes]);

  return (
    <Autocomplete
      autoHighlight
      classes={{ root: 'autocomplete', popper: 'autocomplete__popper' }}
      onChange={handleAutocompleteChange}
      options={options}
      getOptionLabel={(option) => option.name || ''}
      value={value || null}
      renderInput={(params) => (
        <TextField
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...params}
          label="Gene"
          variant="outlined"
          margin="normal"
          onChange={handleInputChange}
        />
      )}
    />
  );
};

export default GeneAutocomplete;
