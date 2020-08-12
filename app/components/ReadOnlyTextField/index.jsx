import React, { useEffect, useState } from 'react';
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
  } = props;

  const [width, setWidth] = useState(160);

  useEffect(() => {
    if (children) {
      const calculatedWidth = children.length * 8;

      if (calculatedWidth <= 160) {
        setWidth(160);
      }
      if (calculatedWidth > 160 && calculatedWidth <= 340) {
        setWidth(346);
      }
      if (calculatedWidth > 340) {
        setWidth(528);
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
