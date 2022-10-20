import React, {
  useEffect, useState, useCallback, useContext,
} from 'react';
import { useHistory } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import sortBy from 'lodash/sortBy';

import api, { ApiCallSet } from '@/services/api';
import { formatDate } from '@/utils/date';
import { useUser } from '@/context/UserContext';
import ConfirmContext from '@/context/ConfirmContext';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import DemoDescription from '@/components/DemoDescription';
import DescriptionList from '@/components/DescriptionList';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import PatientEdit from '@/components/PatientEdit';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import VariantChips from './components/VariantChips';
import VariantCounts from './components/VariantCounts';
import TumourSummaryEdit from './components/TumourSummaryEdit';
import {
  PatientInformationType,
  GeneVariantType,
  TumourSummaryType,
  MicrobialType,
} from './types';
import {
  MutationBurdenType, ComparatorType, MsiType, TmburType,
} from '../MutationBurden/types';
import MutationSignatureType from '../MutationSignatures/types';
import { ImmuneType } from '../Immune/types';

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

type GenomicSummaryProps = {
  isPrint: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  loadedDispatch: (section: Record<'type', string>) => void;
} & WithLoadingInjectedProps;

const GenomicSummary = ({
  isPrint = false,
  setIsLoading,
  isLoading,
  loadedDispatch,
}: GenomicSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useUser();
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const history = useHistory();

  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [showTumourSummaryEdit, setShowTumourSummaryEdit] = useState(false);

  const [patientInformation, setPatientInformation] = useState<PatientInformationType[]>();
  const [signatures, setSignatures] = useState<MutationSignatureType[]>([]);
  const [tumourSummary, setTumourSummary] = useState<TumourSummaryType[]>();
  const [primaryBurden, setPrimaryBurden] = useState<MutationBurdenType>();
  const [variants, setVariants] = useState<GeneVariantType[]>();
  const [msi, setMsi] = useState<MsiType>();
  const [tmburMutBur, setTmburMutBur] = useState<TmburType>();

  const [microbial, setMicrobial] = useState<MicrobialType[]>([{
    species: '',
    integrationSite: '',
    ident: '',
    createdAt: null,
    updatedAt: null,
  }]);
  const [tCellCd8, setTCellCd8] = useState<ImmuneType>();
  const [primaryComparator, setPrimaryComparator] = useState<ComparatorType>();
  const [variantFilter, setVariantFilter] = useState<string>('');
  const [variantCounts, setVariantCounts] = useState({
    smallMutation: 0,
    cnv: 0,
    structuralVariant: 0,
    expression: 0,
  });

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/summary/microbial`),
            api.get(`/reports/${report.ident}/summary/genomic-alterations-identified`),
            api.get(`/reports/${report.ident}/comparators`),
            api.get(`/reports/${report.ident}/mutation-signatures`),
            api.get(`/reports/${report.ident}/mutation-burden`),
            api.get(`/reports/${report.ident}/immune-cell-types`),
            api.get(`/reports/${report.ident}/msi`),
          ]);

          const [
            microbialResp,
            variantsResp,
            comparatorsResp,
            signaturesResp,
            burdenResp,
            immuneResp,
            msiResp,
          ] = await apiCalls.request() as [
            MicrobialType[],
            GeneVariantType[],
            ComparatorType[],
            MutationSignatureType[],
            MutationBurdenType[],
            ImmuneType[],
            MsiType[],
          ];

          try {
            const tmburResp = await api.get(`/reports/${report.ident}/tmbur-mutation-burden`).request();
            if (tmburResp) {
              setTmburMutBur(tmburResp);
            }
          } catch (e) {
            // tmbur does not exist in records before this implementation, and no backfill will be done on the backend, silent fail this
            console.error('tmbur-mutation-burden call error', e?.message);
          }

          setPrimaryComparator(comparatorsResp.find(({ analysisRole }) => analysisRole === 'mutation burden (primary)'));
          setPrimaryBurden(burdenResp.find((entry: Record<string, unknown>) => entry.role === 'primary'));
          setTCellCd8(immuneResp.find(({ cellType }) => cellType === 'T cells CD8'));
          setSignatures(signaturesResp);

          if (microbialResp.length) {
            setMicrobial(microbialResp);
          }

          if (msiResp.length) {
            setMsi(msiResp[0]);
          }

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
          if (loadedDispatch) {
            loadedDispatch({ type: 'summary' });
          }
        } catch (err) {
          snackbar.error(`Network error: ${err?.message ?? err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [loadedDispatch, report, setIsLoading, isPrint]);

  useEffect(() => {
    if (report && report.patientInformation) {
      setPatientInformation([
        {
          label: 'Alternate ID',
          value: report.alternateIdentifier,
        },
        {
          label: 'Pediatric Patient IDs',
          value: report.pediatricIds,
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
          label: 'Gender',
          value: report.patientInformation.gender,
        },
      ]);
    }
  }, [report]);

  useEffect(() => {
    if (report) {
      let svBurden: null | string;
      if (primaryBurden && primaryBurden.qualitySvCount !== null) {
        svBurden = `${primaryBurden.qualitySvCount} ${primaryBurden.qualitySvPercentile ? `(${primaryBurden.qualitySvPercentile}%)` : ''}`;
      } else {
        svBurden = null;
      }

      let tCell: null | string;
      if (tCellCd8 && typeof tCellCd8.score === 'number') {
        tCell = `${tCellCd8.score} ${tCellCd8.percentile ? `(${tCellCd8.percentile}%)` : ''}`;
      } else {
        tCell = null;
      }

      let sigs: null | string;
      if (signatures.length && signatures.find((sig) => sig.selected)) {
        sigs = signatures.filter(({ selected }) => selected)
          .map(({ associations, signature }) => (
            `${signature}${associations ? ` (${associations})` : ''}`
          )).join(', ');
      } else {
        sigs = 'Nothing of clinical relevance';
      }

      let msiStatus: null | string;
      if (msi) {
        if (msi?.score < 20) {
          msiStatus = 'MSS';
        }
        if (msi?.score >= 20) {
          msiStatus = 'MSI';
        }
      } else {
        msiStatus = null;
      }

      setTumourSummary([
        {
          term: 'Tumour Content',
          value: `${report.tumourContent}%`,
        },
        {
          term: 'Subtype',
          value: report.subtyping,
        },
        {
          term: 'Microbial Species',
          value: microbial ? microbial.map(({ species, integrationSite }) => {
            let integrationSection = '';
            if (integrationSite) {
              integrationSection = integrationSite.toLowerCase() === 'yes' ? ' (integration)' : ' (no integration)';
            }
            return `${species}${integrationSection}`;
          }).join(', ') : null,
        },
        {
          term: 'CD8+ T Cell Score',
          value: tCell,
        },
        {
          term: 'Mutation Signature',
          value: sigs,
          action: !isPrint ? () => history.push('mutation-signatures') : null,
        },
        {
          term: 'Mutation Burden',
          value: primaryBurden && primaryBurden.totalMutationsPerMb !== null ? `${primaryBurden.totalMutationsPerMb} mut/Mb` : null,
        },
        {
          term: `SV Burden (${primaryComparator ? primaryComparator.name : 'primary'})`,
          value: svBurden,
        },
        {
          term: `HR Deficiency${isPrint ? '*' : ''}`,
          value: null,
        },
        {
          term: `SV Burden${isPrint ? '*' : ''}`,
          value: null,
        },
        {
          term: 'MSI Status',
          value: msiStatus,
        },
        {
          term: 'Genome TMB (mut/mb)', // float
          // Forced to do this due to javascript floating point issues
          value:
            tmburMutBur ? (tmburMutBur.genomeSnvTmb + tmburMutBur.genomeIndelTmb).toFixed(2) : '',
        },
      ]);
    }
  }, [history, microbial, primaryBurden, primaryComparator, isPrint, report, signatures, tCellCd8, msi, tmburMutBur]);

  const handleChipDeleted = useCallback(async (chipIdent, type, comment) => {
    try {
      const req = api.del(
        `/reports/${report.ident}/summary/genomic-alterations-identified/${chipIdent}`,
        { comment },
      );

      if (isSigned) {
        showConfirmDialog(req);
      } else {
        await req.request();
        setVariantCounts((prevVal) => ({ ...prevVal, [type]: prevVal[type] - 1 }));
        setVariants((prevVal) => (prevVal.filter((val) => val.ident !== chipIdent)));
        snackbar.success('Entry deleted');
      }
    } catch (err) {
      console.error(err);
      snackbar.error('Entry NOT deleted due to an error');
    }
  }, [report, isSigned, showConfirmDialog]);

  const handleChipAdded = useCallback(async (variant) => {
    try {
      const req = api.post(`/reports/${report.ident}/summary/genomic-alterations-identified`, { geneVariant: variant });
      const newVariantEntry = await req.request();

      const categorizedVariantEntry = variantCategory(newVariantEntry);

      setVariantCounts((prevVal) => ({ ...prevVal, [categorizedVariantEntry.type]: prevVal[categorizedVariantEntry.type] + 1 }));
      setVariants((prevVal) => ([...prevVal, categorizedVariantEntry]));
      snackbar.success('Entry added');
    } catch (err) {
      console.error(err);
      snackbar.error('Entry NOT added due to an error');
    }
  }, [report]);

  const handlePatientEditClose = useCallback(async (isSaved, newPatientData, newReportData) => {
    setShowPatientEdit(false);

    if (!isSaved || (!newPatientData && !newReportData)) {
      return;
    }

    const reportResp = await api.get(`/reports/${report.ident}`).request();
    setReport(reportResp);

    setPatientInformation([
      {
        label: 'Alternate ID',
        value: reportResp ? reportResp.alternateIdentifier : report.alternateIdentifier,
      },
      {
        label: 'Pediatric Patient IDs',
        value: reportResp ? reportResp.pediatricIds : report.pediatricIds,
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
        value: reportResp ? reportResp.biopsyName : report.biopsyName,
      },
      {
        label: 'Biopsy Details',
        value: newPatientData ? newPatientData.biopsySite : report.patientInformation.biopsySite,
      },
      {
        label: 'Gender',
        value: newPatientData ? newPatientData.gender : report.patientInformation.gender,
      },
    ]);
  }, [report, setReport]);

  const handleTumourSummaryEditClose = (isSaved, newMicrobialData, newReportData, newMutationBurdenData) => {
    setShowTumourSummaryEdit(false);

    if (!isSaved || (!newMicrobialData && !newReportData && !newMutationBurdenData)) {
      return;
    }

    if (newMicrobialData) {
      setMicrobial(newMicrobialData);
    }

    if (newReportData) {
      setReport(newReportData);
    }

    if (newMutationBurdenData) {
      setPrimaryBurden(newMutationBurdenData);
    }
  };

  return (
    <div className="genomic-summary">
      {report && patientInformation && tumourSummary && !isLoading && (
        <>
          <DemoDescription>
            The front page displays general patient and sample information, and provides a highlight of the key sequencing results.
          </DemoDescription>
          <div className="genomic-summary__patient-information">
            <div className="genomic-summary__patient-information-title">
              <Typography variant="h3" display="inline">
                Patient Information
                {canEdit && !isPrint && (
                  <>
                    <IconButton onClick={() => setShowPatientEdit(true)} size="large">
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
                <Grid key={label as string} item>
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
                {canEdit && !isPrint && (
                  <>
                    <IconButton onClick={() => setShowTumourSummaryEdit(true)} size="large">
                      <EditIcon />
                    </IconButton>
                    <TumourSummaryEdit
                      microbial={microbial}
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

          {isPrint ? (
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
                  variants={variantFilter ? variants.filter((v) => v.type === variantFilter) : variants}
                  canEdit={canEdit}
                  onChipDeleted={handleChipDeleted}
                  onChipAdded={handleChipAdded}
                  isPrint={isPrint}
                />
              </div>
            </div>
          ) : (
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
                  variants={variantFilter ? variants.filter((v) => v.type === variantFilter) : variants}
                  canEdit={canEdit}
                  onChipDeleted={handleChipDeleted}
                  onChipAdded={handleChipAdded}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(GenomicSummary);
