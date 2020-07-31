import React from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
} from '@material-ui/core';

import './index.scss';

const ReadOnlyTextField = (props) => {
  const {
    label,
    children,
    ...rest
  } = props;

  return (
    <TextField
      className="text-field-fix"
      title={children}
      label={label}
      value={children === null || children === '' ? ' ' : children}
      classes={{ root: 'text-field' }}
      disabled
      {...rest}
    />
  );
};

ReadOnlyTextField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.string,
};

ReadOnlyTextField.defaultProps = {
  label: '',
  children: '',
};

export default ReadOnlyTextField;
