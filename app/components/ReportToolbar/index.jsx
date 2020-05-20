import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  IconButton,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import './index.scss';

function ReportToolbar(props) {
  const {
    diagnosis,
    patientId,
    type,
    state,
    isVisible,
    toggleIsVisible,
  } = props;

  return (
    <span className="report__header">
      <Typography display="inline" variant="h6" className="report__header--min-width">
        {diagnosis}
      </Typography>
      <Typography display="inline" variant="h6">
        {patientId}
        {` ${type} Report`}
      </Typography>
      <Typography display="inline" variant="h6">
        {state}
      </Typography>
      <IconButton
        onClick={toggleIsVisible}
      >
        {isVisible ? (
          <ChevronRightIcon
            title="Show Report Sections"
          />
        ) : (
          <ChevronLeftIcon
            title="Show Report Sections"
          />
        )}
      </IconButton>
    </span>
  );
}

ReportToolbar.propTypes = {
  diagnosis: PropTypes.string,
  patientId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  toggleIsVisible: PropTypes.func.isRequired,
};

ReportToolbar.defaultProps = {
  diagnosis: '',
};

export default ReportToolbar;
