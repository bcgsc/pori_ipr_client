import React, {
  useEffect, useState, useCallback, useContext,
} from 'react';
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

type Props = {
  print: boolean,
  loadedDispatch: (section: Record<'type', string>) => void,
};

const GenomicSummary = ({ print, loadedDispatch }: Props): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
  const { isSigned } = useContext(ConfirmContext);
  const snackbar = useContext(SnackbarContext);
  const history = useHistory();

  const [showPatientEdit, setShowPatientEdit] = useState<boolean>(false);
  const [showTumourSummaryEdit, setShowTumourSummaryEdit] = useState<boolean>(false);

  const [patientInformation, setPatientInformation] = useState<Array<Record<string, unknown>>>();
  const [microbial, setMicrobial] = useState<Array<Record<string, unknown>>>([]);
  const [signatures, setSignatures] = useState<Array<Record<string, unknown>>>([]);
  const [tumourSummary, setTumourSummary] = useState<Array<Record<string, unknown>>>();
  const [primaryBurden, setPrimaryBurden] = useState<Record<string, unknown>>();
  const [variants, setVariants] = useState<Array<Record<string, unknown>>>();

  const [tCellCd8, setTCellCd8] = useState<Record<string, unknown>>();
  const [primaryComparator, setPrimaryComparator] = useState<Record<string, unknown>>();
  const [analysisSummary, setAnalysisSummary] = useState<Array<Record<string, unknown>>>();
  const [variantFilter, setVariantFilter] = useState<string>('');
  const [variantCounts, setVariantCounts] = useState({
    smallMutation: 0,
    cnv: 0,
    structuralVariant: 0,
    expression: 0,
  });

  useEffect(() => {
    if (report && report.patientInformation) {
      const getData = async () => {
        const call = api.get(`/reports/${report.ident}/immune-cell-types`);
        const [
          microbialResp,
          variantsResp,
          comparatorsResp,
          signaturesResp,
          burdenResp,
          immuneResp,
        ] = await Promise.all([
          getMicrobial(report.ident),
          AlterationsService.all(report.ident),
          getComparators(report.ident),
          getMutationSignatures(report.ident),
          getMutationBurden(report.ident),
          call.request(),
        ]);

        const tCellCd8Temp = immuneResp.find(({ cellType }) => cellType === 'T cells CD8');
        const primaryBurdenTemp = burdenResp.find((entry: Record<string, unknown>) => entry.role === 'primary');
        const primaryComparatorTemp = comparatorsResp.find(({ analysisRole }) => analysisRole === 'mutation burden (primary)');

        setPrimaryComparator(primaryComparatorTemp);
        setPrimaryBurden(primaryBurdenTemp);
        setMicrobial(microbialResp);
        setSignatures(signaturesResp);
        setTCellCd8(tCellCd8Temp);

        setPatientInformation([
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
        if (primaryBurdenTemp && primaryBurdenTemp.qualitySvCount !== null) {
          svBurden = `${primaryBurdenTemp.qualitySvCount} ${primaryBurdenTemp.qualitySvPercentile ? `(${primaryBurdenTemp.qualitySvPercentile}%)` : ''}`;
        } else {
          svBurden = null;
        }

        let tCell;
        if (tCellCd8Temp && typeof tCellCd8Temp.score === 'number') {
          tCell = `${tCellCd8Temp.score} ${tCellCd8Temp.percentile ? `(${tCellCd8Temp.percentile}%)` : ''}`;
        } else {
          tCell = null;
        }

        setTumourSummary([
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
            value: microbialResp && microbialResp.length ? microbialResp[0].species : null,
          },
          {
            term: 'Immune Infiltration',
            value: tCell,
          },
          {
            term: 'Mutation Signature',
            value: signaturesResp
              .filter(({ selected }) => selected)
              .map(({ associations, signature }) => (
                `${signature} (${associations})`
              )).join(', '),
            action: () => history.push('mutation-signatures'),
          },
          {
            term: `Mutation Burden (${primaryComparatorTemp ? primaryComparatorTemp.name : 'primary'})`,
            value: primaryBurdenTemp && primaryBurdenTemp.totalMutationsPerMb !== null ? `${primaryBurdenTemp.totalMutationsPerMb} mut/Mb` : null,
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

        const normalComparator = comparatorsResp.find(({ analysisRole }) => analysisRole === 'expression (primary site)');
        const diseaseComparator = comparatorsResp.find(({ analysisRole }) => analysisRole === 'expression (disease)');

        setAnalysisSummary([
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

        variantsResp.forEach((variant, k) => {
          // Add processed Variant
          output.push(variantCategory(variant));

          // Update counts
          if (!counts[variantsResp[k].type]) {
            counts[variantsResp[k].type] = 0;
          }
          counts[variantsResp[k].type] += 1;
        });
        const sorted = sortBy(output, [customTypeSort, 'geneVariant']);
        setVariants(sorted);
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
      setVariants(prevVal => (prevVal.filter(val => val.ident !== chipIdent)));
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
      setVariants(prevVal => ([...prevVal, categorizedVariantEntry]));
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

    setPatientInformation([
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
      setMicrobial(newMicrobialData);
    } else {
      apiCalls.push({ request: () => null });
    }

    if (newReportData) {
      apiCalls.push(api.put(`/reports/${report.ident}`, newReportData));
    } else {
      apiCalls.push({ request: () => null });
    }

    if (newMutationBurdenData) {
      if (primaryBurden) {
        apiCalls.push(api.put(`/reports/${report.ident}/mutation-burden/${primaryBurden.ident}`, newMutationBurdenData));
      } else {
        apiCalls.push(api.post(`/reports/${report.ident}/mutation-burden`, newMutationBurdenData));
      }
    }

    const callSet = new ApiCallSet(apiCalls);
    const [_, reportResp, primaryBurdenResp] = await callSet.request(isSigned);

    if (reportResp) {
      setReport(reportResp);
    }

    let microbialUpdate;
    if (newMicrobialData && newMicrobialData.length) {
      microbialUpdate = newMicrobialData[0].species;
    } else if (microbial && microbial.length) {
      microbialUpdate = microbial[0].species;
    } else {
      microbialUpdate = null;
    }

    let primaryBurdenTotalUpdate;
    if (primaryBurdenResp && primaryBurdenResp.totalMutationsPerMb !== null) {
      primaryBurdenTotalUpdate = `${primaryBurdenResp.totalMutationsPerMb} mut/Mb`;
    } else if (primaryBurden && primaryBurden.totalMutationsPerMb !== null) {
      primaryBurdenTotalUpdate = `${primaryBurden.totalMutationsPerMb} mut/Mb`;
    } else {
      primaryBurdenTotalUpdate = null;
    }

    let primaryBurdenSvUpdate;
    if (primaryBurdenResp && primaryBurdenResp.qualitySvCount !== null) {
      primaryBurdenSvUpdate = `${primaryBurdenResp.qualitySvCount} ${primaryBurdenResp.qualitySvPercentile ? `(${primaryBurdenResp.qualitySvPercentile}%)` : ''}`;
    } else if (primaryBurden && primaryBurden.qualitySvCount !== null) {
      primaryBurdenSvUpdate = `${primaryBurden.qualitySvCount} ${primaryBurden.qualitySvPercentile ? `(${primaryBurden.qualitySvPercentile}%)` : ''}`;
    } else {
      primaryBurdenSvUpdate = null;
    }


    let tCellUpdate;
    if (tCellCd8 && typeof tCellCd8.score === 'number') {
      tCellUpdate = `${tCellCd8.score} ${tCellCd8.percentile ? `(${tCellCd8.percentile}%)` : ''}`;
    } else {
      tCellUpdate = null;
    }

    setTumourSummary([
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
        value: microbialUpdate,
      },
      {
        term: 'Immune Infiltration',
        value: tCellUpdate,
      },
      {
        term: 'Mutation Signature',
        value: signatures
          .filter(({ selected }) => selected)
          .map(({ associations, signature }) => (
            `${signature} (${associations})`
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
  }, [isSigned, microbial, primaryBurden, tCellCd8, report.tumourContent, report.subtyping, report.ident, signatures, primaryComparator, print, setReport, history]);

  return (
    <div className="genomic-summary">
      {report && patientInformation && tumourSummary && analysisSummary && (
        <>
          <div className="genomic-summary__patient-information">
            <div className="genomic-summary__patient-information-title">
              <Typography variant="h3" display="inline">
                Patient Information
                {canEdit && (
                  <>
                    <IconButton onClick={() => setShowPatientEdit(true)}>
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
              {patientInformation.map(({ label, value }) => (
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
                    <IconButton onClick={() => setShowTumourSummaryEdit(true)}>
                      <EditIcon />
                    </IconButton>
                    <TumourSummaryEdit
                      microbial={microbial[0]}
                      report={report}
                      mutationBurden={primaryBurden}
                      isOpen={showTumourSummaryEdit}
                      onClose={handleTumourSummaryEditClose}
                    />
                  </>
                )}
              </Typography>
            </div>
            <div className="genomic-summary__tumour-summary-content">
              <DescriptionList entries={tumourSummary} />
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
                    variants={variantFilter ? variants.filter(v => v.type === variantFilter) : variants}
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
                  {analysisSummary.map(({ label, value }) => (
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
                  {analysisSummary.map(({ label, value }) => (
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
                    variants={variantFilter ? variants.filter(v => v.type === variantFilter) : variants}
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
