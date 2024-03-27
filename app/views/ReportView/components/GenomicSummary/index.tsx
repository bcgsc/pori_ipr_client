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

import api, { ApiCallSet } from '@/services/api';
import { formatDate } from '@/utils/date';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import DemoDescription from '@/components/DemoDescription';
import DescriptionList from '@/components/DescriptionList';
import ReportContext, { PatientInformationType, ReportType } from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import PatientEdit from '@/components/PatientEdit';
import TumourSummaryEdit from '@/components/TumourSummaryEdit';
import {
  TumourSummaryType, MicrobialType, ImmuneType, MutationBurdenType, TmburType, MsiType,
} from '@/common';
import SummaryPrintTable from '@/components/SummaryPrintTable';
import useReport from '@/hooks/useReport';

import {
  ComparatorType,
} from '../MutationBurden/types';
import MutationSignatureType from '../MutationSignatures/types';

import './index.scss';

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

  const classNamePrefix = printVersion ? 'genomic-summary--print' : 'genomic-summary';

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/summary/microbial`),
            api.get(`/reports/${report.ident}/comparators`),
            api.get(`/reports/${report.ident}/mutation-signatures`),
            api.get(`/reports/${report.ident}/mutation-burden`),
            api.get(`/reports/${report.ident}/immune-cell-types`),
            api.get(`/reports/${report.ident}/msi`),
          ]);

          const [
            microbialResp,
            comparatorsResp,
            signaturesResp,
            burdenResp,
            immuneResp,
            msiResp,
          ] = await apiCalls.request() as [
            MicrobialType[],
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
            // eslint-disable-next-line no-console
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
        if (tCellCd8.pedsScore) {
          tCell = `${tCellCd8.pedsScore} ${tCellCd8.pedsPercentile ? `(${tCellCd8.pedsPercentile}%)` : ''}`;
        } else {
          tCell = `${tCellCd8.score} ${tCellCd8.percentile ? `(${tCellCd8.percentile}%)` : ''}`;
        }
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
          term:
            tCellCd8?.pedsScore ? 'Pediatric CD8+ T Cell Score' : 'CD8+ T Cell Score',
          value: tCell,
        },
        {
          term: 'Pediatric CD8+ T Cell Comment',
          value:
            tCellCd8?.pedsScoreComment ? tCellCd8?.pedsScoreComment : null,
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
          term: 'CAPTIV-8 Score',
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
        </>
      )}
    </div>
  );
};

export default withLoading(GenomicSummary);
