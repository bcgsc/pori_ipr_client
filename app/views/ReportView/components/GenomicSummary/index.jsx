import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
} from '@material-ui/core';
import sortBy from 'lodash.sortby';

import { getMicrobial } from '@/services/reports/microbial';
import { formatDate } from '@/utils/date';
import AlterationsService from '@/services/reports/genomic-alterations.service';
import DisabledTextField from '@/components/DisabledTextField';
import DescriptionList from '@/components/DescriptionList';
import VariantChips from './components/VariantChips';
import VariantCounts from './components/VariantCounts';

import './index.scss';

const variantCategory = (variant) => {
  // small mutations
  if (/[:(][gcp]\./.exec(variant.geneVariant)) {
    variant.type = 'smallMutation';
    return variant;
  }
  // Structural Variants
  if (variant.geneVariant.includes('::') || variant.geneVariant.includes('fusion')) {
    variant.type = 'structuralVariant';
    return variant;
  }
  // Expression Outliers
  if (variant.geneVariant.toLowerCase().includes('express')
    || variant.geneVariant.toLowerCase().includes('outlier')
    || variant.geneVariant.toLowerCase().includes('percentile')
  ) {
    variant.type = 'expression';
    return variant;
  }
  variant.type = 'cnv';
  return variant;
};

const GenomicSummary = (props) => {
  const {
    report,
    reportEdit,
    print,
  } = props;

  const [patientInformationData, setPatientInformationData] = useState();
  const [tumourSummaryData, setTumourSummaryData] = useState();
  const [variantData, setVariantData] = useState();
  const [variantFilter, setVariantFilter] = useState();
  const [variantCounts, setVariantCounts] = useState({
    cnv: 0,
    smallMutation: 0,
    structuralVariant: 0,
    expression: 0,
  });

  useEffect(() => {
    if (report && report.patientInformation) {
      const getData = async () => {
        const microbial = await getMicrobial(report.ident);
        const variants = await AlterationsService.all(report.ident);

        setPatientInformationData([
          {
            label: 'Alternate ID',
            value: report.alternateIdentifier,
          },
          {
            label: 'Report Date',
            value: formatDate(report.createdAt),
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
            value: report.tumourAnalysis.mutationSignature.map(({ associations, signature }) => (
              `${signature} (${associations})`
            )).join(', '),
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

        const output = [];
        const counts = {
          cnv: 0,
          smallMutation: 0,
          expression: 0,
          structuralVariant: 0,
        };

        variants.forEach((variant, k) => {
          // Add processed Variant
          output.push(variantCategory(variant));

          // Update counts
          if (!counts[variants[k].type]) {
            counts[variants[k].type] = 0;
          }
          counts[variants[k].type] += 1;
        });
        setVariantData(sortBy(output, ['type', 'geneVariant']));
        setVariantCounts(counts);
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
          <div className="genomic-summary__alterations">
            <div className="genomic-summary__alterations-title">
              <Typography variant="h3">
                Key Genomic and Transcriptomic Alterations Identified
              </Typography>
            </div>
            <div className="genomic-summary__alterations-content">
              <VariantCounts
                filter={variantFilter}
                counts={variantCounts}
                onToggleFilter={setVariantFilter}
              />
              <VariantChips
                variants={variantFilter ? variantData.filter(v => v.type === variantFilter) : variantData}
              />
            </div>
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
