import React from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
} from '@material-ui/core';

import './index.scss';

const DisabledTextField = (props) => {
  const {
    label,
    disableUnderline,
    children,
    ...rest
  } = props;

  return (
    <TextField
      className="text-field-fix"
      label={label}
      value={children === null || children === '' ? ' ' : children}
      classes={{ root: 'text-field' }}
      InputProps={{ disableUnderline }}
      disabled
      {...rest}
    />
  );
};

DisabledTextField.propTypes = {
  label: PropTypes.string,
  disableUnderline: PropTypes.bool,
  children: PropTypes.string,
};

DisabledTextField.defaultProps = {
  label: '',
  disableUnderline: false,
  children: '',
};

export default DisabledTextField;
