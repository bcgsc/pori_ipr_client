import React from 'react';
import {
  Typography,
} from '@mui/material';

type RunningCenterProps = {
  className?: string;
};

const RunningCenter = ({
  className,
}: RunningCenterProps): JSX.Element => (
  <Typography className={className} variant="caption">
    BC Cancer Confidential - For Research Purposes Only
  </Typography>
);

export default RunningCenter;
