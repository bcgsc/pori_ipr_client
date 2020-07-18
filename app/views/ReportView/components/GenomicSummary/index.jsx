import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
} from '@material-ui/core';

import DisabledTextField from '@/components/DisabledTextField';

import './index.scss';

const GenomicSummary = (props) => {
  const {
    report,
    reportEdit,
    print,
  } = props;

  const [patientInformationData, setPatientInformationData] = useState();

  useEffect(() => {
    if (report && report.patientInformation) {
      setPatientInformationData([
        {
          label: 'Alternate ID',
          value: report.alternateIdentifier,
        },
        {
          label: 'Report Date',
          value: report.createdAt,
        },
        {
          label: 'Case Type',
          value: report.patientInformation.caseType,
        },
        {
          label: 'Physician',
          value: report.patientInformation.physician,
        },
      ]);
    }
  }, [report]);

  return (
    <div className="genomic-summary">
      {report && patientInformationData ? (
        <>
          <div className="genomic-summary__patient-information">
            <div className="genomic-summary__patient-information-title">
              <Typography variant="h3">
                Patient Information
              </Typography>
            </div>
            <div className="genomic-summary__patient-information-content">
              {patientInformationData.map(({ label, value }) => (
                <DisabledTextField
                  key={label}
                  label={label}
                  margin="normal"
                  fullWidth
                  multiline={print}
                  disableUnderline={print}
                >
                  {value}
                </DisabledTextField>
              ))}
            </div>
          </div>
          <div className="genomic-summary__tumour-summary">
            <Typography variant="h3">
              Tumour Summary
            </Typography>
          </div>
          <div className="genomic-summary__therapeutic-summary">
            <Typography variant="h3">
              Therapeutic Summary
            </Typography>
          </div>
        </>
      ) : null}
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
