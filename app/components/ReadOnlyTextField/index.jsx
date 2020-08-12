import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  TextField, Typography,
} from '@material-ui/core';

import './index.scss';

const NON_BREAKING_SPACE = '\u00A0';
const WIDTH_FACTOR = 8;
const WIDTH_SMALL = 160;
const WIDTH_MEDIUM = 346;
const WIDTH_LARGE = 528;

const ReadOnlyTextField = (props) => {
  const {
    label,
    children,
  } = props;

  const [width, setWidth] = useState(160);

  useEffect(() => {
    if (children) {
      const calculatedWidth = children.length * WIDTH_FACTOR;

      if (calculatedWidth <= WIDTH_SMALL) {
        setWidth(WIDTH_SMALL);
      }
      if (calculatedWidth > WIDTH_SMALL && calculatedWidth <= WIDTH_MEDIUM) {
        setWidth(WIDTH_MEDIUM);
      }
      if (calculatedWidth > WIDTH_MEDIUM) {
        setWidth(WIDTH_LARGE);
      }
    }
  }, [children]);

  return (
    <span className="text-field" style={{ width }}>
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
