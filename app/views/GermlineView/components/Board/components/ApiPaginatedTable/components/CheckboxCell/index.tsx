import React from 'react';
import {
  Checkbox,
} from '@material-ui/core';

import './index.scss';

type props = {
  value: boolean,
};

const CheckboxCell = ({ value }: props): JSX.Element => (
  <Checkbox
    classes={{ root: 'checkbox-cell' }}
    checked={value}
  />
);

export default CheckboxCell;
