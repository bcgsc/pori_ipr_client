import React, {
  useEffect, useState,
  useCallback,
  useMemo,
} from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/material';

import DemoDescription from '@/components/DemoDescription';

import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import {
  TumourSummaryType, ComparatorType, ImmuneType, MicrobialType, MutationBurdenType,
  TmburType,
  MsiType,
} from '@/common';
import { MutationSignatureType } from '@/views/ReportView/components/MutationSignatures';
import useReport from '@/hooks/useReport';

import { getMicbSiteSummary } from '@/utils/getMicbSiteIntegrationStatusLabel';
import { SummaryProps } from '@/commonComponents';
import { TumourSummaryEditProps } from '@/components/TumourSummaryEdit';

import './index.scss';

import {
  useReportComparators, useReportImmuneCellTypes, useReportSummaryMicrobial, useReportMutationBurden, useReportMutationSignatures,
  useReportTmburMutationBurden,
  useReportMsi,
} from '@/queries/get';
import PatientInformation from '../PatientInformation';

import TumourSummary from '../TumourSummary';

type GenomicSummaryProps = {
  loadedDispatch?: SummaryProps['loadedDispatch'];
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
} & WithLoadingInjectedProps;

const GenomicSummary = ({
  isPrint = false,
  printVersion = null,
  setIsLoading,
  isLoading,
  loadedDispatch,
}: GenomicSummaryProps): JSX.Element => {
  const { report, canEdit: reportContextCanEdit } = useReport();
  let canEdit = reportContextCanEdit;
  if (report.state === 'completed') {
    canEdit = false;
  }
  const history = useHistory();

  const [tumourSummary, setTumourSummary] = useState<TumourSummaryType[]>();

  const classNamePrefix = printVersion ? 'genomic-summary--print' : 'genomic-summary';
  const {
    data: microbial,
    isError: microbialError,
    isLoading: isMicrobialLoading,
  } = useReportSummaryMicrobial<MicrobialType[]>(
    report.ident,
    {
      staleTime: Infinity,
      enabled: !!report?.ident,
      onError: () => console.error('microbial call error'),
    },
  );

  const {
    data: primaryComparator,
    isError: primaryComparatorError,
    isLoading: isPrimaryComparatorLoading,
  } = useReportComparators<ComparatorType[], ComparatorType | undefined>(
    report.ident,
    {
      staleTime: Infinity,
      enabled: !!report?.ident,
      select: (data) => data?.find(({ analysisRole }) => analysisRole === 'mutation burden (primary)'),
      onError: () => console.error('comparators call error'),
    },
  );

  const {
    data: signatures,
    isError: signaturesError,
    isLoading: isSignaturesLoading,
  } = useReportMutationSignatures<MutationSignatureType[]>(
    report.ident,
    {
      staleTime: Infinity,
      enabled: !!report?.ident,
      onError: () => console.error('mutation signatures call error'),
    },
  );

  const {
    data: reportImmuneCellTypes,
    isError: tCellCd8Error,
    isLoading: isTCellCd8Loading,
  } = useReportImmuneCellTypes<ImmuneType[]>(
    report?.ident,
    {
      staleTime: Infinity,
      enabled: !!report?.ident,
      onError: () => console.error('immune cell types call error'),
    },
  );
  const tCellCd8 = useMemo(
    () => reportImmuneCellTypes?.find(({ cellType }) => cellType === 'T cells CD8'),
    [reportImmuneCellTypes],
  );

  const {
    data: reportMutationBurden,
    isError: primaryBurdenError,
    isLoading: isPrimaryBurdenLoading,
  } = useReportMutationBurden<MutationBurdenType[]>(
    report?.ident,
    {
      staleTime: Infinity,
      enabled: !!report?.ident,
      onError: () => console.error('mutation burden call error'),
    },
  );
  const primaryBurden = useMemo(
    () => reportMutationBurden?.find((entry: Record<string, unknown>) => entry.role === 'primary'),
    [reportMutationBurden],
  );

  const {
    data: msi,
    isError: msiError,
    isLoading: isMsiLoading,
  } = useReportMsi<MsiType[], MsiType>(
    report?.ident,
    {
      staleTime: Infinity,
      enabled: !!report?.ident,
      select: (response) => (response.length ? response[0] : null),
      onError: () => console.error('msi call error'),
    },
  );

  const {
    data: tmburMutBur,
    isLoading: isTmburMutBurLoading,
  } = useReportTmburMutationBurden<TmburType>(
    report?.ident,
    {
      staleTime: Infinity,
      enabled: !!report?.ident,
      select: (response) => response,
      onError: () => console.error('tmbur mutation burden call error'),
    },
  );

  const someLoading = isMicrobialLoading
    && isPrimaryComparatorLoading
    && isSignaturesLoading
    && isTCellCd8Loading
    && isPrimaryBurdenLoading
    && isMsiLoading
    && isTmburMutBurLoading;

  useEffect(() => {
    if (report) {
      if (loadedDispatch && !someLoading) {
        loadedDispatch({ type: 'summary-genomic' });
      }
      if (!someLoading) {
        setIsLoading(false);
      }
    }
  }, [report, loadedDispatch, setIsLoading, someLoading]);

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
      if (signatures?.length && signatures.find((sig) => sig.selected)) {
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
            value:
              tmburMutBur?.adjustedTmbComment && !tmburMutBur.tmbHidden ? tmburMutBur.adjustedTmbComment : null,
          },
        ]);
      });
    }
  }, [history, microbial, primaryBurden, primaryComparator, isPrint, report, signatures, tCellCd8, msi, tmburMutBur, report.captiv8Score]);

  const handleTumourSummaryEditClose: TumourSummaryEditProps['onEditClose'] = useCallback((
    isSaved,
  ) => {
    if (!isSaved) {
      return undefined;
    }
    return undefined;
  }, []);

  if (isLoading || !report || !tumourSummary || microbialError || primaryComparatorError || signaturesError || primaryBurdenError || tCellCd8Error || msiError) {
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
                tumourSummary={tumourSummary}
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
              tumourSummary={tumourSummary}
            />
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(GenomicSummary);
