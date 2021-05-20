import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';

import ReportContext from '@/context/ReportContext';

import './index.scss';

const PageBreak = (props) => {
  const {
    theme,
  } = props;

  const { report } = useContext(ReportContext);

  return (
    <MuiThemeProvider theme={theme}>
      {report && (
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
      )}
    </MuiThemeProvider>
  );
};

PageBreak.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  report: PropTypes.object.isRequired,
  theme: PropTypes.object,
};

PageBreak.defaultProps = {
  theme: {},
};

export default PageBreak;
