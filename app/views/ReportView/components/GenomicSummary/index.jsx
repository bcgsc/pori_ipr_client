import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Typography,
  IconButton,
  Grid,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { SnackbarContext } from '@bcgsc/react-snackbar-provider';
import sortBy from 'lodash.sortby';

import api, { ApiCallSet } from '@/services/api';
import { getMicrobial } from '@/services/reports/microbial';
import { getComparators } from '@/services/reports/comparators';
import { getMutationSignatures } from '@/services/reports/mutation-signature';
import { getMutationBurden } from '@/services/reports/mutation-burden';
import { formatDate } from '@/utils/date';
import ReportContext from '../../../../components/ReportContext';
import EditContext from '@/components/EditContext';
import ConfirmContext from '@/components/ConfirmContext';
import AlterationsService from '@/services/reports/genomic-alterations.service';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import DescriptionList from '@/components/DescriptionList';
import PageBreak from '@/components/PageBreak';
import VariantChips from './components/VariantChips';
import VariantCounts from './components/VariantCounts';
import PatientEdit from './components/PatientEdit';
import TumourSummaryEdit from './components/TumourSummaryEdit';

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

  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
  const { isSigned } = useContext(ConfirmContext);
  const snackbar = useContext(SnackbarContext);
  const history = useHistory();

  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [patientInformationData, setPatientInformationData] = useState();
  const [showTumourSummaryEdit, setShowTumourSummaryEdit] = useState(false);

  const [microbialData, setMicrobialData] = useState([]);
  const [signatureData, setSignatureData] = useState([]);
  const [tumourSummaryData, setTumourSummaryData] = useState();
  const [primaryBurdenData, setPrimaryBurdenData] = useState();
  const [primaryComparator, setPrimaryComparator] = useState();
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
          burden,
        ] = await Promise.all([
          getMicrobial(report.ident),
          AlterationsService.all(report.ident),
          getComparators(report.ident),
          getMutationSignatures(report.ident),
          getMutationBurden(report.ident),
        ]);

        const primaryBurden = burden.find(entry => entry.role === 'primary');
        const primaryComparatorTemp = comparators.find(({ analysisRole }) => analysisRole === 'mutation burden (primary)');

        setPrimaryComparator(primaryComparatorTemp);
        setPrimaryBurdenData(primaryBurden);
        setMicrobialData(microbial);
        setSignatureData(signatures);

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

        let svBurden;
        if (primaryBurden && primaryBurden.qualitySvCount !== null) {
          svBurden = `${primaryBurden.qualitySvCount} ${primaryBurden.qualitySvPercentile ? `(${primaryBurden.qualitySvPercentile}%)` : ''}`;
        } else {
          svBurden = null;
        }

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
            value: microbial && microbial.length ? microbial[0].species : null,
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
                `${signature} ${associations ? `(${associations})` : ''}`
              )).join(', '),
            action: () => history.push('mutation-signatures'),
          },
          {
            term: `Mutation Burden (${primaryComparatorTemp ? primaryComparatorTemp.name : 'primary'})`,
            value: primaryBurden && primaryBurden.totalMutationsPerMb !== null ? `${primaryBurden.totalMutationsPerMb} mut/Mb` : null,
          },
          {
            term: `SV Burden (${primaryComparatorTemp ? primaryComparatorTemp.name : 'primary'})`,
            value: svBurden,
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
            label: 'Ploidy Model',
            value: report.ploidy,
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
        loadedDispatch({ type: 'genomicSummary' });
      };

      getData();
    }
  }, [report, print, loadedDispatch, history]);

  const handleChipDeleted = useCallback(async (chipIdent, type, comment) => {
    try {
      const req = api.del(
        `/reports/${report.ident}/summary/genomic-alterations-identified/${chipIdent}`,
        { comment },
      );
      await req.request(isSigned);

      setVariantCounts(prevVal => ({ ...prevVal, [type]: prevVal[type] - 1 }));
      setVariantData(prevVal => (prevVal.filter(val => val.ident !== chipIdent)));
      snackbar.add('Entry deleted');
    } catch (err) {
      console.error(err);
      snackbar.add('Entry NOT deleted due to an error');
    }
  }, [report, isSigned, snackbar]);

  const handleChipAdded = useCallback(async (variant) => {
    try {
      const req = api.post(`/reports/${report.ident}/summary/genomic-alterations-identified`, { geneVariant: variant });
      const newVariantEntry = await req.request();

      const categorizedVariantEntry = variantCategory(newVariantEntry);

      setVariantCounts(prevVal => ({ ...prevVal, [categorizedVariantEntry.type]: prevVal[categorizedVariantEntry.type] + 1 }));
      setVariantData(prevVal => ([...prevVal, categorizedVariantEntry]));
      snackbar.add('Entry added');
    } catch (err) {
      console.error(err);
      snackbar.add('Entry NOT added due to an error');
    }
  }, [report, snackbar]);

  const handlePatientEditClose = useCallback(async (isSaved, newPatientData, newReportData) => {
    const apiCalls = [];
    setShowPatientEdit(false);

    if (!isSaved || (!newPatientData && !newReportData)) {
      return;
    }

    if (newPatientData) {
      apiCalls.push(api.put(`/reports/${report.ident}/patient-information`, newPatientData));
    }

    if (newReportData) {
      apiCalls.push(api.put(`/reports/${report.ident}`, newReportData));
    }

    const callSet = new ApiCallSet(apiCalls);
    const [_, reportResp] = await callSet.request(isSigned);

    if (reportResp) {
      setReport({ ...reportResp, ...report });
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
  }, [isSigned, report, setReport]);

  const handleTumourSummaryEditClose = useCallback(async (isSaved, newMicrobialData, newReportData, newMutationBurdenData) => {
    const apiCalls = [];
    setShowTumourSummaryEdit(false);

    if (!isSaved || (!newMicrobialData && !newReportData && !newMutationBurdenData)) {
      return;
    }

    if (newMicrobialData) {
      apiCalls.push(api.put(`/reports/${report.ident}/microbial`, newMicrobialData));
      setMicrobialData(newMicrobialData);
    } else {
      apiCalls.push({ request: () => null });
    }

    if (newReportData) {
      apiCalls.push(api.put(`/reports/${report.ident}`, newReportData));
    } else {
      apiCalls.push({ request: () => null });
    }

    if (newMutationBurdenData) {
      if (primaryBurdenData) {
        apiCalls.push(api.put(`/reports/${report.ident}/mutation-burden/${primaryBurdenData.ident}`, newMutationBurdenData));
      } else {
        apiCalls.push(api.post(`/reports/${report.ident}/mutation-burden`, newMutationBurdenData));
      }
    }

    const callSet = new ApiCallSet(apiCalls);
    const [_, reportResp, primaryBurdenResp] = await callSet.request(isSigned);

    if (reportResp) {
      setReport(reportResp);
    }

    let microbialUpdateData;
    if (newMicrobialData && newMicrobialData.length) {
      microbialUpdateData = newMicrobialData[0].species;
    } else if (microbialData && microbialData.length) {
      microbialUpdateData = microbialData[0].species;
    } else {
      microbialUpdateData = null;
    }

    let primaryBurdenTotalUpdate;
    if (primaryBurdenResp && primaryBurdenResp.totalMutationsPerMb !== null) {
      primaryBurdenTotalUpdate = `${primaryBurdenResp.totalMutationsPerMb} mut/Mb`;
    } else if (primaryBurdenData && primaryBurdenData.totalMutationsPerMb !== null) {
      primaryBurdenTotalUpdate = `${primaryBurdenData.totalMutationsPerMb} mut/Mb`;
    } else {
      primaryBurdenTotalUpdate = null;
    }

    let primaryBurdenSvUpdate;
    if (primaryBurdenResp && primaryBurdenResp.qualitySvCount !== null) {
      primaryBurdenSvUpdate = `${primaryBurdenResp.qualitySvCount} ${primaryBurdenResp.qualitySvPercentile ? `(${primaryBurdenResp.qualitySvPercentile}%)` : ''}`;
    } else if (primaryBurdenData && primaryBurdenData.qualitySvCount !== null) {
      primaryBurdenSvUpdate = `${primaryBurdenData.qualitySvCount} ${primaryBurdenData.qualitySvPercentile ? `(${primaryBurdenData.qualitySvPercentile}%)` : ''}`;
    } else {
      primaryBurdenSvUpdate = null;
    }

    setTumourSummaryData([
      {
        term: 'Tumour Content',
        value: newReportData ? newReportData.tumourContent : report.tumourContent,
      },
      {
        term: 'Subtype',
        value: newReportData ? newReportData.subtyping : report.subtyping,
      },
      {
        term: 'Microbial Species',
        value: microbialUpdateData,
      },
      {
        term: `Immune Infiltration${print ? '*' : ''}`,
        value: null,
      },
      {
        term: 'Mutation Signature',
        value: signatureData
          .filter(({ selected }) => selected)
          .map(({ associations, signature }) => (
            `${signature} ${associations ? `(${associations})` : ''}`
          )).join(', '),
        action: () => history.push('mutation-signatures'),
      },
      {
        term: `Mutation Burden (${primaryComparator ? primaryComparator.name : 'primary'})`,
        value: primaryBurdenTotalUpdate,
      },
      {
        term: `SV Burden (${primaryComparator ? primaryComparator.name : 'primary'})`,
        value: primaryBurdenSvUpdate,
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
  }, [report, isSigned, history, microbialData, primaryBurdenData, print, setReport, signatureData]);

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
                    <IconButton onClick={setShowPatientEdit}>
                      <EditIcon />
                    </IconButton>
                    <PatientEdit
                      patientInformation={report.patientInformation}
                      report={report}
                      isOpen={Boolean(showPatientEdit)}
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
                <Grid key={label} item>
                  <ReadOnlyTextField label={label}>
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
                {canEdit && (
                  <>
                    <IconButton onClick={setShowTumourSummaryEdit}>
                      <EditIcon />
                    </IconButton>
                    <TumourSummaryEdit
                      microbial={microbialData[0]}
                      report={report}
                      mutationBurden={primaryBurdenData}
                      isOpen={showTumourSummaryEdit}
                      onClose={handleTumourSummaryEditClose}
                    />
                  </>
                )}
              </Typography>
            </div>
            <div className="genomic-summary__tumour-summary-content">
              <DescriptionList entries={tumourSummaryData} />
            </div>
          </div>

          {print ? (
            <React.Fragment>
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
                    onChipDeleted={handleChipDeleted}
                    onChipAdded={handleChipAdded}
                    isPrint={print}
                  />
                </div>
              </div>
              <PageBreak report={report} />
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
                    <Grid key={label} item>
                      <ReadOnlyTextField label={label}>
                        {value}
                      </ReadOnlyTextField>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
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
                    <Grid key={label} item>
                      <ReadOnlyTextField label={label}>
                        {value}
                      </ReadOnlyTextField>
                    </Grid>
                  ))}
                </Grid>
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
                    onChipDeleted={handleChipDeleted}
                    onChipAdded={handleChipAdded}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
        </>
      )}
    </div>
  );
};

GenomicSummary.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  print: PropTypes.bool,
  loadedDispatch: PropTypes.func,
};

GenomicSummary.defaultProps = {
  print: false,
  loadedDispatch: () => {},
};

export default GenomicSummary;
