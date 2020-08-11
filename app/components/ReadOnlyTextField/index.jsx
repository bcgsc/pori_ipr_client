import React from 'react';
import PropTypes from 'prop-types';
import {
  TextField, Typography,
} from '@material-ui/core';

import './index.scss';

const NON_BREAKING_SPACE = '\u00A0';

const ReadOnlyTextField = (props) => {
  const {
    label,
    children,
    ...rest
  } = props;

  return (
    <span className="text-field">
      <Typography variant="caption">
        {label}
      </Typography>
      <Typography>
        {children === null || children === '' ? NON_BREAKING_SPACE : children}
      </Typography>
    </span>
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
