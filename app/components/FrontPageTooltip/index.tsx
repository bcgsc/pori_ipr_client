import React from 'react';
import {
  Tooltip,
} from '@mui/material';
import FlareIcon from '@mui/icons-material/Flare';

import './index.scss';

const FrontPageTooltip = (): JSX.Element => (
  <Tooltip
    placement="right"
    title="This field is shown on the front page"
    enterTouchDelay={1}
  >
    <FlareIcon
      classes={{ root: 'tooltip__icon' }}
    />
  </Tooltip>
);

export default FrontPageTooltip;
