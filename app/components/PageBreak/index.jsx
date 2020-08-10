import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

import './index.scss';

const PageBreak = (props) => {
  const {
    report,
  } = props;

  return (
    <span className="page-break">
      <Typography display="inline" variant="caption" className="page-break__text--left">
        {report.patientId}
      </Typography>
      <Typography align="center" display="inline" variant="caption" className="page-break__text--middle">
        BCCA Confidential - For Research Purposes Only
      </Typography>
      <Typography align="right" display="inline" variant="caption" className="page-break__text-right">
        {report.patientInformation.diagnosis}
      </Typography>
    </span>
  );
};

PageBreak.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  report: PropTypes.object.isRequired,
};

export default PageBreak;
