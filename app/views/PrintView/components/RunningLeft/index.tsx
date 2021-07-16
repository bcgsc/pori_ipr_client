import React, { useContext } from 'react';
import {
  Typography,
} from '@material-ui/core';

import ReportContext from '@/context/ReportContext';

type RunningLeftProps = {
  className?: string;
};

const RunningLeft = ({
  className = '',
}: RunningLeftProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  return (
    <Typography className={className} variant="caption">
      {report.patientId}
    </Typography>
  )
};

export default RunningLeft;
