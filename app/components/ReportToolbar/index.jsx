import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  IconButton,
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import startCase from '@/utils/startCase';
import {
  REPORT_TYPE_TO_TITLE,
  REPORT_TYPE_TO_SUFFIX,
} from '@/constants';

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
    const titleFirstPart = REPORT_TYPE_TO_SUFFIX[type];
    const titleSecondPart = REPORT_TYPE_TO_TITLE[type];
    if (!titleFirstPart && !titleSecondPart) return '';
    return `${titleFirstPart}${titleFirstPart ? ` - ${titleSecondPart}` : titleSecondPart}`;
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
        size="large"
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
