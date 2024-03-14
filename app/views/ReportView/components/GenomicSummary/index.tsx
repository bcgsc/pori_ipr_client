import React, {
  useEffect, useState, useCallback, useContext, useMemo,
} from 'react';
import { useHistory } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Grid,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import sortBy from 'lodash/sortBy';

import api, { ApiCallSet } from '@/services/api';
import { formatDate } from '@/utils/date';
import ConfirmContext from '@/context/ConfirmContext';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import DemoDescription from '@/components/DemoDescription';
import DescriptionList from '@/components/DescriptionList';
import ReportContext, { PatientInformationType, ReportType } from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import PatientEdit from '@/components/PatientEdit';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import TumourSummaryEdit from '@/components/TumourSummaryEdit';
import {
  TumourSummaryType, MicrobialType, ImmuneType, MutationBurdenType, TmburType, MsiType,
} from '@/common';
import SummaryPrintTable from '@/components/SummaryPrintTable';
import useReport from '@/hooks/useReport';

import VariantChips from './components/VariantChips';
import VariantCounts from './components/VariantCounts';
import {
  GeneVariantType,
} from './types';
import {
  ComparatorType,
} from '../MutationBurden/types';
import MutationSignatureType from '../MutationSignatures/types';

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
  loadedDispatch?: ({ type }: { type: string }) => void;
  isPrint: boolean;
  printVersion?: 'stable' | 'beta' | null;
} & WithLoadingInjectedProps;

const GenomicSummary = ({
  isPrint = false,
  printVersion = null,
  setIsLoading,
  isLoading,
  loadedDispatch,
}: GenomicSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useReport();
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const history = useHistory();

  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [showTumourSummaryEdit, setShowTumourSummaryEdit] = useState(false);

  const [patientInformation, setPatientInformation] = useState<{
    label: string;
    value: string | null;
  }[] | null>();
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

  const classNamePrefix = printVersion ? 'genomic-summary--print' : 'genomic-summary';

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
            // TODO
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
          value: msiStatus ?? null,
        },
        {
          term: 'Captiv 8 Score',
          value: report.captiv8Score !== null
            ? `${report.captiv8Score}`
            : null,
        },
        {
          term:
            tmburMutBur?.adjustedTmb ? 'Adjusted TMB (Mut/Mb)' : 'Genome TMB (Mut/Mb)', // float
          // Forced to do this due to javascript floating point issues
          value:
            tmburMutBur && !tmburMutBur.tmbHidden ? tmburMutBur.adjustedTmb?.toFixed(2) ?? (tmburMutBur.genomeSnvTmb + tmburMutBur.genomeIndelTmb).toFixed(2) : null,
        },
        {
          term: 'Adjusted TMB Comment',
          value:
            tmburMutBur?.adjustedTmbComment && !tmburMutBur.tmbHidden ? tmburMutBur.adjustedTmbComment : null,
        },
      ]);
    }
  }, [history, microbial, primaryBurden, primaryComparator, isPrint, report, signatures, tCellCd8, msi, tmburMutBur, report.captiv8Score]);

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
      snackbar.error('Entry NOT added due to an error');
    }
  }, [report]);

  const handlePatientEditClose = useCallback((
    newPatientData: PatientInformationType,
    newReportData: ReportType,
  ) => {
    setShowPatientEdit(false);

    if (!newPatientData && !newReportData) {
      return;
    }

    if (newReportData) {
      setReport((oldReport) => ({ ...oldReport, ...newReportData }));
    }

    if (newPatientData) {
      setPatientInformation([
        {
          label: 'Alternate ID',
          value: newReportData ? newReportData.alternateIdentifier : report.alternateIdentifier,
        },
        {
          label: 'Pediatric Patient IDs',
          value: newReportData ? newReportData.pediatricIds : report.pediatricIds,
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
          label: 'Gender',
          value: newPatientData ? newPatientData.gender : report.patientInformation.gender,
        },
      ]);
    }
  }, [report, setReport]);

  const handleTumourSummaryEditClose = useCallback((
    isSaved: boolean,
    newMicrobialData: MicrobialType[],
    newReportData: ReportType,
    newTCellCd8Data: ImmuneType,
    newMutationBurdenData: MutationBurdenType,
    newTmBurMutBurData: TmburType,
  ) => {
    setShowTumourSummaryEdit(false);

    if (!isSaved || (!newMicrobialData && !newReportData && !newTCellCd8Data && !newMutationBurdenData && !newTmBurMutBurData)) {
      return;
    }

    if (newMicrobialData) {
      setMicrobial(newMicrobialData);
    }

    if (newReportData) {
      setReport(newReportData);
    }

    if (newTCellCd8Data) {
      setTCellCd8(newTCellCd8Data);
    }

    if (newMutationBurdenData) {
      setPrimaryBurden(newMutationBurdenData);
    }

    if (newTmBurMutBurData) {
      setTmburMutBur(newTmBurMutBurData);
    }
  }, [setReport]);

  const patientInfoSection = useMemo(() => {
    if (!patientInformation || !report) {
      return null;
    }

    let patientEditButton = null;
    if (canEdit && !printVersion) {
      patientEditButton = (
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
      );
    }

    let dataSection = (
      <Grid
        alignItems="flex-end"
        container
        spacing={3}
        className={`${classNamePrefix}__patient-information-content`}
      >
        {patientInformation.map(({ label, value }) => (
          <Grid key={label as string} item>
            <ReadOnlyTextField label={label}>
              {value}
            </ReadOnlyTextField>
          </Grid>
        ))}
      </Grid>
    );

    let titleSection = (
      <div className={`${classNamePrefix}__patient-information-title`}>
        <Typography variant="h3" display="inline">
          Patient Information
          {patientEditButton}
        </Typography>
      </div>
    );

    if (printVersion === 'beta') {
      titleSection = (
        <div className={`${classNamePrefix}__patient-information-title`}>
          <Typography variant="h5" fontWeight="bold" display="inline">
            Patient Information
          </Typography>
        </div>
      );
      dataSection = (
        <SummaryPrintTable
          data={patientInformation}
          labelKey="label"
          valueKey="value"
        />
      );
    }

    return (
      <div className={`${classNamePrefix}__patient-information`}>
        {titleSection}
        {dataSection}
      </div>
    );
  }, [canEdit, classNamePrefix, handlePatientEditClose, patientInformation, report, showPatientEdit, printVersion]);

  const tumourSummarySection = useMemo(() => {
    if (!tumourSummary || !report) {
      return null;
    }

    let tumourEditButton = null;
    if (canEdit && !printVersion) {
      tumourEditButton = (
        <>
          <IconButton onClick={() => setShowTumourSummaryEdit(true)} size="large">
            <EditIcon />
          </IconButton>
          <TumourSummaryEdit
            microbial={microbial}
            report={report}
            tCellCd8={tCellCd8}
            mutationBurden={primaryBurden}
            tmburMutBur={tmburMutBur}
            isOpen={showTumourSummaryEdit}
            onClose={handleTumourSummaryEditClose}
          />
        </>
      );
    }

    let titleSection = (
      <div className={`${classNamePrefix}__tumour-summary-title`}>
        <Typography variant="h3" display="inline">
          Tumour Summary
          {tumourEditButton}
        </Typography>
      </div>
    );

    let dataSection = (
      <div className={`${classNamePrefix}__tumour-summary-content`}>
        <DescriptionList entries={tumourSummary} />
      </div>
    );

    if (printVersion === 'beta') {
      titleSection = (
        <div className={`${classNamePrefix}__tumour-summary-title`}>
          <Typography variant="h5" fontWeight="bold" display="inline">Tumour Summary</Typography>
        </div>
      );
      dataSection = (
        <SummaryPrintTable
          data={tumourSummary}
          labelKey="term"
          valueKey="value"
        />
      );
    }

    return (
      <div className={`${classNamePrefix}__tumour-summary`}>
        {titleSection}
        {dataSection}
      </div>
    );
  }, [canEdit, classNamePrefix, handleTumourSummaryEditClose, microbial, tCellCd8, primaryBurden, tmburMutBur, report, showTumourSummaryEdit, tumourSummary, printVersion]);

  const alterationsSection = useMemo(() => {
    let titleSection = (
      <Typography variant="h3">
        Key Genomic and Transcriptomic Alterations Identified
      </Typography>
    );
    let dataSection = (
      <>
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
          isPrint={Boolean(printVersion)}
        />
      </>
    );

    if (printVersion === 'beta') {
      titleSection = (
        <Typography variant="h5" fontWeight="bold" display="inline">Key Genomic and Transcriptomic Alterations Identified</Typography>
      );
      if (variants) {
        const uniqueTypesArray = [...new Set(variants.map(({ type }) => type))].sort();
        const categorizedDataArray = [];
        uniqueTypesArray.forEach((variantType) => {
          categorizedDataArray.push({
            key: variantType,
            value: variants.filter(({ type }) => type === variantType),
          });
        });
        dataSection = (
          <SummaryPrintTable
            data={categorizedDataArray}
            labelKey="key"
            valueKey="value"
            renderValue={(val) => val.map(({ geneVariant }) => (
              <Box sx={{ paddingLeft: 0.75, display: 'inline-block' }}>
                <Typography variant="caption">{geneVariant}</Typography>
              </Box>
            ))}
          />
        );
      }
    }

    return (
      <div className={`${classNamePrefix}__alterations`}>
        <div className={`${classNamePrefix}__alterations-title`}>
          {titleSection}
        </div>
        <div className={`${classNamePrefix}__alterations-content`}>
          {dataSection}
        </div>
      </div>
    );
  }, [canEdit, classNamePrefix, handleChipAdded, handleChipDeleted, printVersion, variantCounts, variantFilter, variants]);

  if (isLoading || !report || !patientInformation || !tumourSummary) {
    return null;
  }

  if (printVersion === 'beta') {
    return (
      <div className={classNamePrefix}>
        <DemoDescription>
          The front page displays general patient and sample information, and provides a highlight of the key sequencing results.
        </DemoDescription>
        <Box
          sx={{
            display: 'flex',
            placeContent: 'space-between',
          }}
        >
          <Box sx={{ width: '45%' }}>
            {patientInfoSection}
          </Box>
          <Box sx={{ minWidth: '45%', maxWidth: '54%' }}>
            {tumourSummarySection}
          </Box>
        </Box>
        {alterationsSection}
      </div>
    );
  }

  return (
    <div className={classNamePrefix}>
      {report && patientInformation && tumourSummary && (
        <>
          <DemoDescription>
            The front page displays general patient and sample information, and provides a highlight of the key sequencing results.
          </DemoDescription>
          {patientInfoSection}
          {tumourSummarySection}
          {alterationsSection}
        </>
      )}
    </div>
  );
};

export default withLoading(GenomicSummary);
