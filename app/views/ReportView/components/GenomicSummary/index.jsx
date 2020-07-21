import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
} from '@material-ui/core';

import { getMicrobial } from '@/services/reports/microbial';
import DisabledTextField from '@/components/DisabledTextField';
import DescriptionList from '@/components/DescriptionList';

import './index.scss';

const GenomicSummary = (props) => {
  const {
    report,
    reportEdit,
    print,
  } = props;

  const [patientInformationData, setPatientInformationData] = useState();
  const [tumourSummaryData, setTumourSummaryData] = useState();

  useEffect(() => {
    if (report && report.patientInformation) {
      const getData = async () => {
        const microbial = await getMicrobial(report.ident);

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

        setTumourSummaryData([
          {
            term: 'Tumour Content',
            value: report.tumourAnalysis.tumourContent,
          },
          {
            term: 'Subtype',
            value: report.tumourAnalysis.subtyping,
          },
          {
            term: 'Microbial Species',
            value: microbial.species,
          },
          {
            term: `Immune Infiltration${print ? '*' : ''}`,
            value: null,
          },
          {
            term: 'Mutation Signature',
            value: report.tumourAnalysis.mutationSignature.map(({ associations, signature }, index) => (
              `${signature} (${associations})${index < report.tumourAnalysis.mutationSignature.length - 1 ? ', ' : ''}`
            )),
          },
          {
            term: `HR Deficiency${print ? '*' : ''}`,
            value: null,
          },
          {
            term: 'Mutation Burden',
            value: null,
          },
          {
            term: `SV Burden${print ? '*' : ''}`,
            value: null,
          },
          {
            term: 'MSI Status',
            value: null,
          },
        ]);
      };

      getData();
    }
  }, [report]);

  return (
    <div className="genomic-summary">
      {report && patientInformationData && tumourSummaryData && (
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
            <div className="genomic-summary__tumour-summary-title">
              <Typography variant="h3">
                Tumour Summary
              </Typography>
            </div>
            <div className="genomic-summary__tumour-summary-content">
              <DescriptionList entries={tumourSummaryData} />
            </div>
          </div>
          <div className="genomic-summary__therapeutic-summary">
            <Typography variant="h3">
              Therapeutic Summary
            </Typography>
          </div>
        </>
      )}
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
