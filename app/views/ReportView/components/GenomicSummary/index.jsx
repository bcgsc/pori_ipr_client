import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
} from '@material-ui/core';

import './index.scss';

const GenomicSummary = (props) => {
  const {
    report,
    reportEdit,
    print,
  } = props;

  return (
    <div className="genomic-summary">
      <div className="genomic-summary__patient-information">
        <Typography>
          Patient Information
        </Typography>
      </div>
      <div className="genomic-summary__tumour-summary">
        <Typography>
          Tumour Summary
        </Typography>
      </div>
      <div className="genomic-summary__therapeutic-summary">
        <Typography>
          Therapeutic Summary
        </Typography>
      </div>
    </div>
  );
};

GenomicSummary.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  report: PropTypes.object,
  reportEdit: PropTypes.bool,
  print: PropTypes.bool,
};

GenomicSummary.defaultProps = {
  report: {},
  reportEdit: false,
  print: false,
};

export default GenomicSummary;
