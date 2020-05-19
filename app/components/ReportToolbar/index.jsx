import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
} from '@material-ui/core';

import './index.scss';

function ReportToolbar(props) {
  const {
    diagnosis,
    patientId,
    type,
    state,
  } = props;

  return (
    <span className="report__header">
      <Typography display="inline" variant="h6">
        {diagnosis}
      </Typography>
      <Typography display="inline" variant="h6">
        {patientId}
        {` ${type} Report`}
      </Typography>
      <Typography display="inline" variant="h6">
        {state}
      </Typography>
    </span>
  );
}

ReportToolbar.propTypes = {
  diagnosis: PropTypes.string,
  patientId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
};

ReportToolbar.defaultProps = {
  diagnosis: '',
};

export default ReportToolbar;
