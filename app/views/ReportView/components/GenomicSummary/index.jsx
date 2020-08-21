import React, { useEffect, useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  Snackbar,
  IconButton,
  Grid,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import sortBy from 'lodash.sortby';

import { getMicrobial } from '@/services/reports/microbial';
import { getComparators } from '@/services/reports/comparators';
import { getMutationSignatures } from '@/services/reports/mutation-signature';
import { formatDate } from '@/utils/date';
import ReportContext from '../ReportContext';
import EditContext from '@/components/EditContext';
import AlterationsService from '@/services/reports/genomic-alterations.service';
import PatientInformationService from '@/services/reports/patient-information.service';
import ReportService from '@/services/reports/report.service';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import DescriptionList from '@/components/DescriptionList';
import PageBreak from '@/components/PageBreak';
import VariantChips from './components/VariantChips';
import VariantCounts from './components/VariantCounts';
import PatientEdit from './components/PatientEdit';

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
    print,
    loadedDispatch,
  } = props;

  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isPatientEditOpen, setIsPatientEditOpen] = useState(false);
  const [patientInformationData, setPatientInformationData] = useState();
  const [tumourSummaryData, setTumourSummaryData] = useState();
  const [analysisSummaryData, setAnalysisSummaryData] = useState();
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
        const [
          microbial,
          variants,
          comparators,
          signatures,
        ] = await Promise.all([
          getMicrobial(report.ident),
          AlterationsService.all(report.ident),
          getComparators(report.ident),
          getMutationSignatures(report.ident),
        ]);

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
          {
            label: 'Biopsy Name',
            value: report.biopsyName,
          },
          {
            label: 'Biopsy Details',
            value: report.patientInformation.biopsySite,
          },
          {
            label: 'Sex',
            value: report.patientInformation.gender,
          },
        ]);

        setTumourSummaryData([
          {
            term: 'Tumour Content',
            value: report.tumourContent,
          },
          {
            term: 'Subtype',
            value: report.subtyping,
          },
          {
            term: 'Microbial Species',
            value: microbial ? microbial.species : null,
          },
          {
            term: `Immune Infiltration${print ? '*' : ''}`,
            value: null,
          },
          {
            term: 'Mutation Signature',
            value: signatures
              .filter(({ selected }) => selected)
              .map(({ associations, signature }) => (
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

        const normalComparator = comparators.find(({ analysisRole }) => analysisRole === 'expression (primary site)');
        const diseaseComparator = comparators.find(({ analysisRole }) => analysisRole === 'expression (disease)');

        setAnalysisSummaryData([
          {
            label: 'Constitutional Protocol',
            value: report.patientInformation.constitutionalProtocol,
          },
          {
            label: 'Constitutional Sample',
            value: report.patientInformation.constitutionalSample,
          },
          {
            label: 'Normal Comparator',
            value: normalComparator ? normalComparator.name : 'Not specified',
          },
          {
            label: 'Disease Comparator',
            value: diseaseComparator ? diseaseComparator.name : 'Not specified',
          },
          {
            label: 'Ploidy',
            value: report.ploidy,
          },
        ])

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
        loadedDispatch({ type: 'genomicSummary' });
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
  }, [report]);

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
  }, [report]);

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowSnackbar(false);
  }, []);

  const handlePatientEditClose = useCallback(async (isSaved, newPatientData, newReportData) => {
    setIsPatientEditOpen(false);
    if (!isSaved || !newPatientData && !newReportData) {
      return;
    }

    if (newPatientData) {
      await PatientInformationService.update(report.ident, newPatientData);
    }

    if (newReportData) {
      await ReportService.updateReport(newReportData);
    }

    setPatientInformationData([
      {
        label: 'Alternate ID',
        value: newReportData ? newReportData.alternateIdentifier : report.alternateIdentifier,
      },
      {
        label: 'Report Date',
        value: formatDate(report.createdAt),
      },
      {
        label: 'Case Type',
        value: newPatientData ? newPatientData.caseType : report.patientInformation.caseType,
      },
      {
        label: 'Physician',
        value: newPatientData ? newPatientData.physician : report.patientInformation.physician,
      },
      {
        label: 'Biopsy Name',
        value: newReportData ? newReportData.biopsyName : report.biopsyName,
      },
      {
        label: 'Biopsy Details',
        value: newPatientData ? newPatientData.biopsySite : report.patientInformation.biopsySite,
      },
      {
        label: 'Sex',
        value: newPatientData ? newPatientData.gender : report.patientInformation.gender,
      },
    ]);
  }, [report]);

  return (
    <div className="genomic-summary">
      {report && patientInformationData && tumourSummaryData && analysisSummaryData && (
        <>
          <div className="genomic-summary__patient-information">
            <div className="genomic-summary__patient-information-title">
              <Typography variant="h3" dislay="inline">
                Patient Information
                {canEdit && (
                  <>
                    <IconButton onClick={setIsPatientEditOpen}>
                      <EditIcon />
                    </IconButton>
                    <PatientEdit
                      patientInformation={report.patientInformation}
                      report={report}
                      isOpen={Boolean(isPatientEditOpen)}
                      onClose={handlePatientEditClose}
                    />
                  </>
                )}
              </Typography>
            </div>
            <Grid
              alignItems="flex-end"
              container
              spacing={3}
              className="genomic-summary__patient-information-content"
            >
              {patientInformationData.map(({ label, value }) => (
                <Grid item>
                  <ReadOnlyTextField
                    key={label}
                    label={label}
                  >
                    {value}
                  </ReadOnlyTextField>
                </Grid>
              ))}
            </Grid>
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
          {print && (
            <PageBreak report={report} />
          )}
          <div className="genomic-summary__analysis-summary">
            <div className="genomic-summary__analysis-summary-title">
              <Typography variant="h3">
                Analysis Summary
              </Typography>
            </div>
            <Grid
              alignItems="flex-end"
              container
              spacing={3}
              className="genomic-summary__analysis-summary-content"
            >
              {analysisSummaryData.map(({ label, value }) => (
                <Grid item>
                  <ReadOnlyTextField
                    key={label}
                    label={label}
                  >
                    {value}
                  </ReadOnlyTextField>
                </Grid>
              ))}
            </Grid>
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
  loadedDispatch: PropTypes.func,
};

GenomicSummary.defaultProps = {
  report: {},
  canEdit: false,
  print: false,
  loadedDispatch: () => {},
};

export default GenomicSummary;
