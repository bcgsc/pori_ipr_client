import React, {
  useEffect, useState, useContext,
  useCallback,
} from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import useReport from '@/hooks/useReport';
import { Box } from '@mui/material';
import api from '@/services/api';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import {
  TumourSummaryType, MicrobialType, ImmuneType, MutationBurdenType, TmburType, MsiType,
} from '@/common';
import { ComparatorType } from '../MutationBurden/types';
import MutationSignatureType from '../MutationSignatures/types';
import { HlaType } from '../Immune/types';
import { getMicbSiteSummary } from '@/utils/getMicbSiteIntegrationStatusLabel';
import { SummaryProps } from '@/commonComponents';
import { TumourSummaryEditProps } from '@/components/TumourSummaryEdit';
import PatientInformation from '../PatientInformation';
import TumourSummary from '../TumourSummary';
import {
  defaultComparator, defaultImmune, defaultMsi, defaultMutationBurden, defaultTmbur,
} from './defaultStates';

import './index.scss';

type GenomicSummaryProps = {
  loadedDispatch?: SummaryProps['loadedDispatch'];
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
} & WithLoadingInjectedProps;

const isHlaEmpty = (hla?: HlaType | null): boolean => {
  if (!hla) return true;
  return (!hla.a1 || hla.a1 === '') && (!hla.a2 || hla.a2 === '') && (!hla.b1 || hla.b1 === '') && (!hla.b2 || hla.b2 === '') && (!hla.c1 || hla.c1 === '') && (!hla.c2 || hla.c2 === '');
};

const GenomicSummary = ({
  isPrint = false,
  printVersion = null,
  setIsLoading,
  isLoading,
  loadedDispatch,
}: GenomicSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  let { canEdit } = useReport();
  if (report.state === 'completed') {
    canEdit = false;
  }
  const history = useHistory();

  const [signatures, setSignatures] = useState<MutationSignatureType[]>([]);
  const [tumourSummary, setTumourSummary] = useState<TumourSummaryType[]>();
  const [primaryBurden, setPrimaryBurden] = useState<MutationBurdenType>(defaultMutationBurden);
  const [msi, setMsi] = useState<MsiType>(defaultMsi);
  const [tmburMutBur, setTmburMutBur] = useState<TmburType>(defaultTmbur);
  const [microbial, setMicrobial] = useState<MicrobialType[]>([]);
  const [tCellCd8, setTCellCd8] = useState<ImmuneType>(defaultImmune);
  const [primaryComparator, setPrimaryComparator] = useState<ComparatorType>(defaultComparator);
  const [hlaNormal, setHlaNormal] = useState<string>();
  const [hlaTumour, setHlaTumour] = useState<string>();
  const [hla, setHla] = useState<HlaType[]>();

  const classNamePrefix = printVersion ? 'genomic-summary--print' : 'genomic-summary';

  const { data: microbialData, isError: microbialError } = useQuery(
    `/reports/${report.ident}/summary/microbial`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      enabled: Boolean(report),
      select: (response) => response,
      onError: () => {
        // eslint-disable-next-line no-console
        console.error('microbial call error');
      },
    },
  );

  const { data: primaryComparatorData, isError: primaryComparatorError } = useQuery(
    `/reports/${report.ident}/comparators`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      enabled: Boolean(report),
      select: (response) => response.find(({ analysisRole }) => analysisRole === 'mutation burden (primary)'),
      onError: () => {
        // eslint-disable-next-line no-console
        console.error('comparators call error');
      },
    },
  );

  const { data: signaturesData, isError: signaturesError } = useQuery(
    `/reports/${report.ident}/mutation-signatures`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      enabled: Boolean(report),
      select: (response) => response,
      onError: () => {
        // eslint-disable-next-line no-console
        console.error('mutation signatures call error');
      },
    },
  );

  const { data: tCellCd8Data, isError: tCellCd8Error } = useQuery(
    `/reports/${report.ident}/immune-cell-types`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      enabled: Boolean(report),
      select: (response) => response.find(({ cellType }) => cellType === 'T cells CD8'),
      onError: () => {
        // eslint-disable-next-line no-console
        console.error('immune cell types call error');
      },
    },
  );

  const { data: primaryBurdenData, isError: primaryBurdenError } = useQuery(
    `/reports/${report.ident}/mutation-burden`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      enabled: Boolean(report),
      select: (response) => response.find((entry: Record<string, unknown>) => entry.role === 'primary'),
      onError: () => {
        // eslint-disable-next-line no-console
        console.error('mutation burden call error');
      },
    },
  );

  const { data: msiData, isError: msiError } = useQuery(
    `/reports/${report.ident}/msi`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      enabled: Boolean(report),
      select: (response) => {
        if (response.length) {
          return response[0];
        }
        return null;
      },
      onError: () => {
        // eslint-disable-next-line no-console
        console.error('msi call error');
      },
    },
  );

  const { data: tmburMutBurData, isError: tmburMutBurError } = useQuery(
    `/reports/${report.ident}/tmbur-mutation-burden`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      enabled: Boolean(report),
      select: (response) => response,
      onError: () => {
        // eslint-disable-next-line no-console
        console.error('tmbur mutation burden call error');
      },
    },
  );

  const { data: hlaData, isError: hlaError } = useQuery(
    `/reports/${report.ident}/hla-types`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      enabled: Boolean(report),
      select: (response) => response,
      onError: () => {
        // eslint-disable-next-line no-console
        console.error('tmbur mutation burden call error');
      },
    },
  );

  useEffect(() => {
    if (report) {
      if (microbialData) {
        setMicrobial(microbialData);
      }
      if (primaryComparatorData) {
        setPrimaryComparator(primaryComparatorData);
      }
      if (signaturesData) {
        setSignatures(signaturesData);
      }
      if (tCellCd8Data) {
        setTCellCd8(tCellCd8Data);
      }
      if (primaryBurdenData) {
        setPrimaryBurden(primaryBurdenData);
      }
      if (msiData) {
        setMsi(msiData);
      }
      if (tmburMutBurData) {
        setTmburMutBur(tmburMutBurData);
      }
      if (hlaData) {
        setHla(hlaData);
        const normal = hlaData.find((h) => h.pathology === 'normal' && !isHlaEmpty(h));
        const tumourDNA = hlaData.find((h) => h.pathology === 'diseased' && h.protocol === 'DNA' && !isHlaEmpty(h));
        const tumourRNA = hlaData.find((h) => h.pathology === 'diseased' && h.protocol === 'RNA' && !isHlaEmpty(h));

        setHlaNormal(normal
          ? `${normal.a1} ${normal.a2} ${normal.b1} ${normal.b2} ${normal.c1} ${normal.c2}`
          : null);

        const tumourHla = tumourDNA ?? tumourRNA;
        setHlaTumour(tumourHla
          ? `${tumourHla.a1} ${tumourHla.a2} ${tumourHla.b1} ${tumourHla.b2} ${tumourHla.c1} ${tumourHla.c2}`
          : null);
      }
      if (loadedDispatch) {
        loadedDispatch({ type: 'summary-genomic' });
      }
      setIsLoading(false);
    }
  }, [
    report,
    microbialData,
    primaryComparatorData,
    signaturesData,
    tCellCd8Data,
    primaryBurdenData,
    msiData,
    tmburMutBurData,
    hlaData,
    loadedDispatch,
    setIsLoading,
  ]);

  useEffect(() => {
    if (report) {
      let svBurden: null | string;
      if (
        primaryBurden
        && primaryBurden.qualitySvCount !== null
        && !primaryBurden.svBurdenHidden
      ) {
        svBurden = `${primaryBurden.qualitySvCount} ${primaryBurden.qualitySvPercentile ? `(${primaryBurden.qualitySvPercentile}%)` : ''}`;
      } else {
        svBurden = null;
      }

      let tCell: null | string;
      if (tCellCd8 && typeof tCellCd8.score === 'number') {
        if (tCellCd8.pedsScore) {
          tCell = `${tCellCd8.pedsScore} ${tCellCd8.pedsPercentile && !tCellCd8.percentileHidden ? `(${tCellCd8.pedsPercentile}%)` : ''}`;
        } else {
          tCell = `${tCellCd8.score} ${tCellCd8.percentile && !tCellCd8.percentileHidden ? `(${tCellCd8.percentile}%)` : ''}`;
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
      } else if (tmburMutBur) {
        if (tmburMutBur?.msiScore < 20) {
          msiStatus = 'MSS';
        }
        if (tmburMutBur?.msiScore >= 20) {
          msiStatus = 'MSI';
        }
      } else {
        msiStatus = null;
      }

      setTumourSummary(() => {
        // Check if genomeTmb (new version) exists
        const { genomeTmb } = report;

        let tmbDisplayValue = 'No data available';

        if (tmburMutBur) {
          const {
            tmbHidden, adjustedTmb, genomeSnvTmb, genomeIndelTmb,
          } = tmburMutBur;
          if (tmbHidden) {
            tmbDisplayValue = null;
          } else if (adjustedTmb != null) {
            tmbDisplayValue = adjustedTmb.toFixed(2);
          } else if (genomeTmb) {
            tmbDisplayValue = genomeTmb.toFixed(2);
          } else if (genomeSnvTmb && genomeIndelTmb) {
            tmbDisplayValue = (genomeSnvTmb + genomeIndelTmb).toFixed(2);
          }
        }

        return ([
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
            value: getMicbSiteSummary(microbial),
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
            term: 'Mutation Signatures',
            value: sigs,
            action: !isPrint ? () => history.push('mutation-signatures') : null,
          },
          {
            term: 'Mutation Burden',
            value: primaryBurden && primaryBurden.totalMutationsPerMb !== null && (!tmburMutBur?.adjustedTmb || tmburMutBur.tmbHidden === true) ? `${primaryBurden.totalMutationsPerMb} Mut/Mb` : null,
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
            term: 'HRD Score',
            value: report.hrdScore !== null
              ? `${report.hrdScore}`
              : null,
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
            term: tmburMutBur?.adjustedTmb ? 'Adjusted TMB (Mut/Mb)' : 'Genome TMB (Mut/Mb)',
            value: tmbDisplayValue,
          },
          {
            term: 'Adjusted TMB Comment',
            value: tmburMutBur?.adjustedTmbComment && !tmburMutBur.tmbHidden ? tmburMutBur.adjustedTmbComment : null,
          },
          {
            term: 'HLA (normal)',
            value: hlaNormal ?? null,
          },
          {
            term: 'HLA (tumour)',
            value: hlaTumour ?? null,
          },
        ]);
      });
    }
  }, [history, microbial, primaryBurden, primaryComparator, isPrint, report, signatures, tCellCd8, msi, tmburMutBur, report.captiv8Score, hlaNormal, hlaTumour]);

  const handleTumourSummaryEditClose: TumourSummaryEditProps['onEditClose'] = useCallback((
    isSaved,
    newMicrobialData,
    newReportData,
    newTCellCd8Data,
    newMutationBurdenData,
    newTmBurMutBurData,
    newMsiData,
    newHlaData,
  ) => {
    if (!isSaved || (!newMicrobialData && !newReportData && !newTCellCd8Data && !newMutationBurdenData && !newTmBurMutBurData && !newMsiData && !newHlaData)) {
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

    if (newMsiData) {
      setMsi(newMsiData);
    }

    if (newHlaData) {
      setHla(newHlaData);
      const normal = newHlaData.find((h) => h.pathology === 'normal' && !isHlaEmpty(h));
      const tumourDNA = newHlaData.find((h) => h.pathology === 'diseased' && h.protocol === 'DNA' && !isHlaEmpty(h));
      const tumourRNA = newHlaData.find((h) => h.pathology === 'diseased' && h.protocol === 'RNA' && !isHlaEmpty(h));

      setHlaNormal(normal
        ? `${normal.a1} ${normal.a2} ${normal.b1} ${normal.b2} ${normal.c1} ${normal.c2}`
        : null);

      const tumourHla = tumourDNA ?? tumourRNA;
      setHlaTumour(tumourHla
        ? `${tumourHla.a1} ${tumourHla.a2} ${tumourHla.b1} ${tumourHla.b2} ${tumourHla.c1} ${tumourHla.c2}`
        : null);
    }
  }, [setReport]);

  if (isLoading || !report || !tumourSummary || microbialError || primaryComparatorError || signaturesError || primaryBurdenError || tCellCd8Error || msiError || tmburMutBurError || hlaError) {
    return null;
  }

  if (printVersion === 'condensedLayout') {
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
            {report && (
              <PatientInformation
                canEdit={canEdit}
                isPrint={isPrint}
                printVersion={printVersion}
                loadedDispatch={loadedDispatch}
              />
            )}
          </Box>
          <Box sx={{ minWidth: '45%', maxWidth: '54%' }}>
            {report && tumourSummary && (
              <TumourSummary
                canEdit={canEdit}
                isPrint={isPrint}
                loadedDispatch={loadedDispatch}
                microbial={microbial}
                mutationBurden={primaryBurden}
                onEditClose={handleTumourSummaryEditClose}
                printVersion={printVersion}
                report={report}
                tCellCd8={tCellCd8}
                tmburMutBur={tmburMutBur ?? null}
                msi={msi ?? null}
                tumourSummary={tumourSummary}
                hla={hla}
              />
            )}
          </Box>
        </Box>
      </div>
    );
  }

  return (
    <div className={classNamePrefix}>
      {report && tumourSummary && (
        <>
          <DemoDescription>
            The front page displays general patient and sample information, and provides a highlight of the key sequencing results.
          </DemoDescription>
          {report && (
            <PatientInformation
              canEdit={canEdit}
              isPrint={isPrint}
              printVersion={printVersion}
              loadedDispatch={loadedDispatch}
            />
          )}
          {report && tumourSummary && (
            <TumourSummary
              canEdit={canEdit}
              isPrint={isPrint}
              loadedDispatch={loadedDispatch}
              microbial={microbial}
              mutationBurden={primaryBurden}
              onEditClose={handleTumourSummaryEditClose}
              printVersion={printVersion}
              report={report}
              tCellCd8={tCellCd8}
              tmburMutBur={tmburMutBur ?? null}
              msi={msi ?? null}
              tumourSummary={tumourSummary}
              hla={hla}
            />
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(GenomicSummary);
