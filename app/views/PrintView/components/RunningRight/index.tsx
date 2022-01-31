import React, { useContext } from 'react';
import {
  Typography,
} from '@mui/material';

import ReportContext from '@/context/ReportContext';

type RunningRightProps = {
  className?: string;
};

const RunningRight = ({
  className = '',
}: RunningRightProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  return (
    <Typography className={className} variant="caption">
      {report.patientInformation.diagnosis}
    </Typography>
  );
};

export default RunningRight;
