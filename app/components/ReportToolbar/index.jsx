import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  IconButton,
} from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import startCase from '@/utils/startCase';

import './index.scss';

function ReportToolbar(props) {
  const {
    diagnosis,
    patientId,
    type,
    state,
    isSidebarVisible,
    onSidebarToggle,
  } = props;

  const reportTitle = useMemo(() => {
    if (type === 'probe') {
      return 'Targeted Gene';
    }
    if (type === 'genomic') {
      return 'Genomic';
    }
    if (type === 'pharmacogenomic') {
      return 'Pharmacogenomic and Germline Targeted Gene';
    }
    return '';
  }, [type]);

  return (
    <span className="report__header">
      <Typography display="inline" variant="h5" className="report__header--text-align-left">
        {startCase(diagnosis)}
      </Typography>
      <Typography display="inline" variant="h5" className="report__header--text-align-center">
        {patientId}
        {` ${reportTitle} Report`}
      </Typography>
      <Typography display="inline" variant="h5" className="report__header--text-align-right">
        {startCase(state)}
      </Typography>
      <IconButton
        onClick={() => onSidebarToggle(!isSidebarVisible)}
        title={`${isSidebarVisible ? 'Close' : 'Open'} Sidebar`}
        className="report__header--max-width"
      >
        {isSidebarVisible
          ? (
            <KeyboardArrowRightIcon />
          )
          : (
            <KeyboardArrowLeftIcon />
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
  isSidebarVisible: PropTypes.bool.isRequired,
  onSidebarToggle: PropTypes.func.isRequired,
};

ReportToolbar.defaultProps = {
  diagnosis: '',
};

export default ReportToolbar;
