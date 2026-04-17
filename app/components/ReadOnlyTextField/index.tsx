import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

import './index.scss';

const NON_BREAKING_SPACE = '\u00A0';
const WIDTH_FACTOR = 8;
const WIDTH_SMALL = 160;
const WIDTH_MEDIUM = 346;
const WIDTH_LARGE = 528;

type ReadOnlyTextFieldProps = {
  label?: string;
  children?: string;
  isUnderlined?: boolean;
};

const ReadOnlyTextField = ({
  label = '',
  children = '',
  isUnderlined = true,
}: ReadOnlyTextFieldProps): JSX.Element => {
  const [width, setWidth] = useState(160);

  useEffect(() => {
    if (children) {
      let weightedLength = 0;

      for (let i = 0; i < children.length; i++) {
        if (children.charAt(i) === children.charAt(i).toUpperCase()) {
          weightedLength += 1.3;
        } else {
          weightedLength += 0.8;
        }
      }

      const calculatedWidth = weightedLength * WIDTH_FACTOR;

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
    <span className={`text-field ${isUnderlined ? 'text-field--underlined' : ''}`} style={{ width }}>
      <Typography variant="caption">
        {label}
      </Typography>
      <Typography>
        {children === null || children === '' ? NON_BREAKING_SPACE : children}
      </Typography>
    </span>
  );
};

export default ReadOnlyTextField;
