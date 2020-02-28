import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import kbAutocomplete from '../../../../../../services/reports/kbAutocomplete';

/**
 * 
 */
function EditDialog(props) {
  const {
    value,
    stopEditing,
    colDef: { field },
  } = props;

  const []
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const onChange = async (event) => {
    if (event.target.value.length > 2) {
      setLoading(true);

      const token = localStorage.getItem(`ngStorage-${CONFIG.STORAGE.KEYCLOAK}`);
      const autocompleted = await kbAutocomplete(token, 'variant', event.target.value);

      setOptions(autocompleted);
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (loading) {
  //     // api call here
  //     const getData = async () => {
  //       const token = localStorage.getItem(`ngStorage-${CONFIG.STORAGE.KEYCLOAK}`);
  //       const autocompleted = await kbAutocomplete(token, 'variant', value);
  //       console.log(autocompleted);
  //       setOptions(autocompleted);
  //     };
  //     getData();
  //   }
    
  //   return () => {
  //     setLoading(false);
  //   };
  // }, [loading]);

  return (
    <Autocomplete
      value={value}
      options={options}
      getOptionLabel={option => option.displayName || option}
      renderInput={params => (
        <TextField
          {...params}
          onChange={onChange}
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

EditDialog.propTypes = {
  value: PropTypes.string.isRequired,
};

EditDialog.prototype.isPopup = true;

export default EditDialog;
