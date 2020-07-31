import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  Snackbar,
} from '@material-ui/core';
import sortBy from 'lodash.sortby';

import { getMicrobial } from '@/services/reports/microbial';
import { formatDate } from '@/utils/date';
import AlterationsService from '@/services/reports/genomic-alterations.service';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
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

const customTypeSort = (variant) => {
  if (variant.type === 'smallMutation') return 0;
  if (variant.type === 'cnv') return 1;
  if (variant.type === 'structuralVariant') return 2;
  return 3;
};

const GenomicSummary = (props) => {
  const {
    report,
    canEdit,
    print,
  } = props;

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [patientInformationData, setPatientInformationData] = useState();
  const [tumourSummaryData, setTumourSummaryData] = useState();
  const [variantData, setVariantData] = useState();
  const [variantFilter, setVariantFilter] = useState();
  const [variantCounts, setVariantCounts] = useState({
    smallMutation: 0,
    cnv: 0,
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
          smallMutation: 0,
          cnv: 0,
          structuralVariant: 0,
          expression: 0,
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
        const sorted = sortBy(output, [customTypeSort, 'geneVariant']);
        setVariantData(sorted);
        setVariantCounts(counts);
      };

      getData();
    }
  }, [report, print]);

  const handleChipDeleted = useCallback(async (chipIdent, type, comment) => {
    try {
      await AlterationsService.remove(report.ident, chipIdent, comment);

      setVariantCounts(prevVal => ({ ...prevVal, [type]: prevVal[type] - 1 }));
      setVariantData(prevVal => (prevVal.filter(val => val.ident !== chipIdent)));
      setShowSnackbar('Entry deleted');
    } catch (err) {
      console.error(err);
      setShowSnackbar('Entry NOT deleted due to an error');
    }
  }, [report.ident]);

  const handleChipAdded = useCallback(async (variant) => {
    try {
      const newVariantEntry = await AlterationsService.create(report.ident, { geneVariant: variant });
      const categorizedVariantEntry = variantCategory(newVariantEntry);

      setVariantCounts(prevVal => ({ ...prevVal, [categorizedVariantEntry.type]: prevVal[categorizedVariantEntry.type] + 1 }));
      setVariantData(prevVal => ([...prevVal, categorizedVariantEntry]));
      setShowSnackbar('Entry added');
    } catch (err) {
      console.error(err);
      setShowSnackbar('Entry NOT added due to an error');
    }
  }, [report.ident]);

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowSnackbar(false);
  }, []);

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
                <ReadOnlyTextField
                  key={label}
                  label={label}
                  margin="normal"
                  fullWidth
                  multiline={print}
                >
                  {value}
                </ReadOnlyTextField>
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
                canEdit={canEdit}
                reportIdent={report.ident}
                handleChipDeleted={handleChipDeleted}
                handleChipAdded={handleChipAdded}
              />
              <Snackbar
                open={Boolean(showSnackbar)}
                message={showSnackbar}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
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
  canEdit: PropTypes.bool,
  print: PropTypes.bool,
};

GenomicSummary.defaultProps = {
  report: {},
  canEdit: false,
  print: false,
};

export default GenomicSummary;
