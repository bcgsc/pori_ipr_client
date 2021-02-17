import React from 'react';
import {
  Tooltip,
} from '@material-ui/core';
import FlareIcon from '@material-ui/icons/Flare';

import './index.scss';

const FrontPageTooltip = (): JSX.Element => (
  <Tooltip
    classes={{ popper: 'tooltip-fix' }}
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
