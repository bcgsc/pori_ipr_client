import React, {
  useEffect, useState, useContext,
} from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/material';
import api, { ApiCallSet } from '@/services/api';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import {
  TumourSummaryType, MicrobialType, ImmuneType, MutationBurdenType, TmburType, MsiType,
} from '@/common';
import useReport from '@/hooks/useReport';

import {
  ComparatorType,
} from '../MutationBurden/types';
import MutationSignatureType from '../MutationSignatures/types';

import './index.scss';

import PatientInformation from '../PatientInformation';

import TumourSummary from '../TumourSummary';

type GenomicSummaryProps = {
  loadedDispatch?: ({ type }: { type: string }) => void;
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
  const { report } = useContext(ReportContext);
  let { canEdit } = useReport();
  if (report.state === 'completed') {
    canEdit = false;
  }
  const history = useHistory();

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
            loadedDispatch({ type: 'summary-genomic' });
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

  if (isLoading || !report || !tumourSummary) {
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
                printVersion={printVersion}
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
              printVersion={printVersion}
              tumourSummary={tumourSummary}
            />
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(GenomicSummary);
