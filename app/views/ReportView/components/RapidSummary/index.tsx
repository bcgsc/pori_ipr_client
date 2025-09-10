import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  Typography,
} from '@mui/material';
import DemoDescription from '@/components/DemoDescription';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import ConfirmContext from '@/context/ConfirmContext';
import SignatureCard, { SignatureType, SignatureUserType } from '@/components/SignatureCard';
import PrintTable from '@/components/PrintTable';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import capitalize from 'lodash/capitalize';
import orderBy from 'lodash/orderBy';
import getMostCurrentObj from '@/utils/getMostCurrentObj';
import {
  TumourSummaryType, ImmuneType, MutationBurdenType, MicrobialType, TmburType, MsiType, KbMatchType,
} from '@/common';
import { Box } from '@mui/system';
import { getMicbSiteSummary } from '@/utils/getMicbSiteIntegrationStatusLabel';
import { TumourSummaryEditProps } from '@/components/TumourSummaryEdit';
import {
  therapeuticAssociationColDefs, cancerRelevanceColDefs, sampleColumnDefs, getGenomicEvent,
} from './columnDefs';
import { RapidVariantEditDialog, FIELDS } from './components/RapidVariantEditDialog';
import { RapidVariantType } from './types';
import { getVariantRelevanceDict } from './utils';
import PatientInformation from '../PatientInformation';
import TumourSummary from '../TumourSummary';

import './index.scss';

const splitIprEvidenceLevels = (kbMatches: KbMatchType[]) => {
  const iprRelevanceDict = {};

  kbMatches.forEach(({ kbMatchedStatements }) => {
    for (const statement of kbMatchedStatements) {
      if (statement.iprEvidenceLevel) {
        if (!iprRelevanceDict[statement.iprEvidenceLevel]) {
          iprRelevanceDict[statement.iprEvidenceLevel] = new Set();
        }
      }
    }
  });

  kbMatches.forEach(({ kbMatchedStatements }: KbMatchType) => {
    // Remove square brackets and add to dictionary
    for (const statement of kbMatchedStatements) {
      if (statement.iprEvidenceLevel && statement.context) {
        iprRelevanceDict[statement.iprEvidenceLevel].add(statement.context.replace(/ *\[[^)]*\] */g, '').toLowerCase());
      }
    }
  });
  return iprRelevanceDict;
};

const filterRelevance = (kbMatches: KbMatchType[], relevance) => kbMatches.map(({ kbMatchedStatements, ...rest }) => ({
  ...rest,
  kbMatchedStatements: kbMatchedStatements
    .filter(
      ({ relevance: statementRelevance }) => statementRelevance === relevance,
    ),
}));

const processPotentialClinicalAssociation = (variant: RapidVariantType) => Object.entries(
  getVariantRelevanceDict(variant.kbMatches),
)
  .map(([relevanceKey, kbMatches]) => {
    const filtered = filterRelevance(kbMatches, relevanceKey);
    const iprEvidenceDict = splitIprEvidenceLevels(filtered);
    const sortedIprKeys = Object.keys(iprEvidenceDict).sort(
      (a, b) => a.localeCompare(b),
    );
    const drugToLevel = new Map();
    for (const iprLevel of sortedIprKeys) {
      const drugs = iprEvidenceDict[iprLevel];
      for (const drug of drugs) {
        if (!drugToLevel.has(drug)) {
          drugToLevel.set(drug, iprLevel);
        }
      }
    }
    const combinedDrugList = [...drugToLevel.entries()]
      .sort(([drugA, levelA], [drugB, levelB]) => {
        const levelCmp = levelA.localeCompare(levelB);
        if (levelCmp !== 0) return levelCmp;
        return drugA[0].localeCompare(drugB[0]); // compare first letter only
      })
      .map(([drug, level]) => `${drug} (${level})`)
      .join(', ');
    return ({
      ...variant,
      ident: `${variant.ident}-${relevanceKey}`,
      potentialClinicalAssociation: `${relevanceKey} to ${combinedDrugList}`,
    });
  });

const splitVariantsByRelevance = (data: RapidVariantType[]): RapidVariantType[] => {
  const returnData = [];
  data.forEach((variant) => {
    returnData.push(...processPotentialClinicalAssociation(variant));
  });
  return returnData;
};

/**
 * Patient Info (obtained by report)
 * Tumour Summary (aggregate)
 *    Initial tumour content (report.tumourContent?)
 *    Mutation burden (/mutation-burden)
 * Genomic Events with Potential Clinical Association
 * Genomic Events with Potential Cancer Relevance
 * Genomic Events with Unknown Significance
 * Signatures (obtained by signatures)
 * Sample Information (obtained by report)
 */
type RapidSummaryProps = {
  loadedDispatch: ({ type }: { type: string }) => void;
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
} & WithLoadingInjectedProps;

const RapidSummary = ({
  loadedDispatch,
  isLoading,
  isPrint = false,
  setIsLoading,
  printVersion = null,
}: RapidSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { setIsSigned } = useContext(ConfirmContext);
  let { canEdit } = useReport();
  if (report.state === 'completed') {
    canEdit = false;
  }

  const [signatures, setSignatures] = useState<SignatureType | null>();
  const [therapeuticAssociationResults, setTherapeuticAssociationResults] = useState<RapidVariantType[] | null>();
  const [cancerRelevanceResults, setCancerRelevanceResults] = useState<RapidVariantType[] | null>();
  const [unknownSignificanceResults, setUnknownSignificanceResults] = useState<RapidVariantType[] | null>();
  const [tumourSummary, setTumourSummary] = useState<TumourSummaryType[]>();
  const [primaryBurden, setPrimaryBurden] = useState<MutationBurdenType>();
  const [tmburMutBur, setTmburMutBur] = useState<TmburType>();
  const [msi, setMsi] = useState<MsiType>();
  const [tCellCd8, setTCellCd8] = useState<ImmuneType>();
  const [microbial, setMicrobial] = useState<MicrobialType[]>([]);
  const [editData, setEditData] = useState();

  const [signatureTypes, setSignatureTypes] = useState<SignatureUserType[]>([]);
  const [showMatchedTumourEditDialog, setShowMatchedTumourEditDialog] = useState(false);
  const [showCancerRelevanceEventsDialog, setShowCancerRelevanceEventsDialog] = useState(false);

  useEffect(() => {
    let apiCalls = null;
    if (report?.ident) {
      const getData = async () => {
        try {
          apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/signatures`),
            api.get(`/reports/${report.ident}/variants?rapidTable=therapeuticAssociation`),
            api.get(`/reports/${report.ident}/variants?rapidTable=cancerRelevance`),
            api.get(`/reports/${report.ident}/variants?rapidTable=unknownSignificance`),
            api.get(`/reports/${report.ident}/tmbur-mutation-burden`),
            api.get(`/reports/${report.ident}/msi`),
            api.get(`/reports/${report.ident}/immune-cell-types`),
            api.get(`/reports/${report.ident}/summary/microbial`),
            api.get(`/templates/${report.template.ident}/signature-types`),
          ]);
          const [
            signaturesResp,
            therapeuticAssociationResp,
            cancerRelevanceResp,
            unknownSignificanceResp,
            tmBurdenResp,
            msiResp,
            immuneResp,
            microbialResp,
            signatureTypesResp,
          ] = await apiCalls.request(true) as [
            PromiseSettledResult<SignatureType>,
            PromiseSettledResult<RapidVariantType[]>,
            PromiseSettledResult<RapidVariantType[]>,
            PromiseSettledResult<RapidVariantType[]>,
            PromiseSettledResult<TmburType>,
            PromiseSettledResult<MsiType[]>,
            PromiseSettledResult<ImmuneType[]>,
            PromiseSettledResult<MicrobialType[]>,
            PromiseSettledResult<SignatureUserType[]>,
          ];

          try {
            const burdenResp = await api.get(`/reports/${report.ident}/mutation-burden`).request();
            if (burdenResp[0].qualitySvCount == null) {
              setPrimaryBurden(null);
            } else {
              setPrimaryBurden(burdenResp[0]);
            }
          } catch (e) {
            // mutation burden does not exist in records before this implementation, and no backfill will be done on the backend, silent fail this
            // eslint-disable-next-line no-console
            console.error('mutation-burden call error', e?.message);
          }

          if (signaturesResp.status === 'fulfilled') {
            setSignatures(signaturesResp.value);
          } else if (!isPrint) {
            snackbar.error(signaturesResp.reason?.content?.error?.message);
          }

          if (therapeuticAssociationResp.status === 'fulfilled') {
            setTherapeuticAssociationResults(
              splitVariantsByRelevance(therapeuticAssociationResp.value),
            );
          } else if (!isPrint) {
            snackbar.error(therapeuticAssociationResp.reason?.content?.error?.message);
          }

          if (cancerRelevanceResp.status === 'fulfilled') {
            setCancerRelevanceResults(cancerRelevanceResp.value);
          } else if (!isPrint) {
            snackbar.error(cancerRelevanceResp.reason?.content?.error?.message);
          }

          if (unknownSignificanceResp.status === 'fulfilled') {
            setUnknownSignificanceResults(unknownSignificanceResp.value);
          } else if (!isPrint) {
            snackbar.error(unknownSignificanceResp.reason?.content?.error?.message);
          }

          if (tmBurdenResp.status === 'fulfilled') {
            setTmburMutBur(tmBurdenResp.value);
          } else if (!isPrint && tmBurdenResp.reason.content?.status !== 404) {
            snackbar.error(tmBurdenResp.reason?.content?.error?.message);
          }

          if (msiResp.status === 'fulfilled') {
            const msiVal = getMostCurrentObj(msiResp.value);
            setMsi(msiVal);
          } else if (!isPrint && msiResp.reason.content?.status !== 404) {
            snackbar.error(msiResp.reason?.content?.error?.message);
          }

          if (immuneResp.status === 'fulfilled') {
            setTCellCd8(immuneResp.value.find(({ cellType }) => cellType === 'T cells CD8'));
          } else if (!isPrint) {
            snackbar.error(immuneResp.reason?.content?.error?.message);
          }

          if (microbialResp.status === 'fulfilled') {
            setMicrobial(microbialResp.value);
          } else if (!isPrint) {
            snackbar.error(microbialResp.reason?.content?.error?.message);
          }

          if (signatureTypesResp.status === 'fulfilled') {
            if (signatureTypesResp.value?.length === 0) {
              const defaultSigatureTypes = [
                { signatureType: 'author' },
                { signatureType: 'reviewer' },
                { signatureType: 'creator' },
              ] as SignatureUserType[];
              setSignatureTypes(defaultSigatureTypes);
            } else {
              setSignatureTypes(signatureTypesResp.value);
            }
          } else if (!isPrint) {
            snackbar.error(signatureTypesResp.reason?.content?.error?.message);
          }
        } catch (err) {
          snackbar.error(`Unknown error: ${err}`);
        } finally {
          setIsLoading(false);
          if (loadedDispatch) {
            loadedDispatch({ type: 'summary-tgr' });
          }
        }
        return apiCalls;
      };

      getData();
    }

    return () => {
      if (apiCalls) {
        apiCalls.abort();
      }
    };
  }, [loadedDispatch, report, setIsLoading, isPrint]);

  useEffect(() => {
    // MSI score now has 2 possible sources: tmbur and reports_msi due to new tool being able to capture MSI in FFPE samples now.
    // Rapid report will now incorporate both sources to retain information in old reports and use updated msi score in future reports
    let msiScore: null | number;
    if (msi && msi.score !== null) {
      msiScore = msi.score;
    } else if (tmburMutBur && tmburMutBur.msiScore !== null) {
      msiScore = tmburMutBur.msiScore;
    } else {
      msiScore = null;
    }

    let svBurden: null | string = null;
    if (primaryBurden) {
      const { qualitySvCount, svBurdenHidden, qualitySvPercentile } = primaryBurden;
      if (qualitySvCount !== null && !svBurdenHidden) {
        svBurden = `${qualitySvCount} ${qualitySvPercentile ? `(${qualitySvPercentile}%)` : ''}`;
      } else {
        svBurden = null;
      }
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

    setTumourSummary(() => {
      let tmbDisplayValue = report?.genomeTmb?.toFixed(2) || null;

      if (tmburMutBur) {
        if (tmburMutBur.tmbHidden) {
          tmbDisplayValue = null;
        } else if (tmburMutBur.adjustedTmb != null) {
          tmbDisplayValue = tmburMutBur.adjustedTmb.toFixed(2);
        }
      }

      return ([
        {
          term: 'Pathology Tumour Content',
          value: `${report.sampleInfo?.find((samp) => samp?.sample?.toLowerCase() === 'tumour').pathoTc ?? ''}`,
        },
        {
          term: 'M1M2 Score',
          value: report.m1m2Score !== null
            ? `${report.m1m2Score}`
            : null,
        },
        {
          term: 'Preliminary CAPTIV-8 Score',
          value: report.captiv8Score !== null
            ? `${report.captiv8Score}`
            : null,
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
          term: 'Mutation Burden',
          value: primaryBurden && primaryBurden.totalMutationsPerMb !== null && (!tmburMutBur?.adjustedTmb || tmburMutBur.tmbHidden === true) ? `${primaryBurden.totalMutationsPerMb} Mut/Mb` : null,
        },
        {
          term: 'SV Burden (POG Average)',
          value: svBurden,
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
          term: 'MSI Score',
          value: `${msiScore} (MSI Status: ${msiScore < 20 ? 'MSS' : 'MSI'})`,
        },
      ]);
    });
  }, [
    microbial, primaryBurden, tmburMutBur, tCellCd8, msi, msi?.score,
    report.m1m2Score, report.sampleInfo, report.tumourContent, report?.genomeTmb, report.captiv8Score,
    tCellCd8?.percentile, tCellCd8?.score, tCellCd8?.percentileHidden, tCellCd8?.pedsScoreComment, tCellCd8?.pedsScore, tCellCd8?.pedsPercentile,
    tmburMutBur?.adjustedTmb, tmburMutBur?.tmbHidden,
  ]);

  const handleSign = useCallback(async (signed: boolean, updatedSignature: SignatureType) => {
    setIsSigned(signed);
    setSignatures(updatedSignature);
  }, [setIsSigned]);

  const handleMatchedTumourEditStart = useCallback((rowData) => {
    setShowMatchedTumourEditDialog(true);
    if (rowData) {
      setEditData(rowData);
    }
  }, []);

  const handleMatchedTumourEditClose = useCallback(async (newData: boolean) => {
    if (newData) {
      // Call API again to get updated data
      try {
        const updateResp = await api.get(`/reports/${report.ident}/variants?rapidTable=therapeuticAssociation`).request();
        setTherapeuticAssociationResults(
          splitVariantsByRelevance(updateResp),
        );
        setShowMatchedTumourEditDialog(false);
      } catch (e) {
        snackbar.error(`Refetching of therapeutic association data failed: ${e.message ? e.message : e}`);
      }
    } else {
      setShowMatchedTumourEditDialog(false);
    }
  }, [report.ident]);

  let therapeuticAssociationSection;
  if (therapeuticAssociationResults?.length > 0) {
    if (isPrint) {
      therapeuticAssociationSection = (
        <PrintTable
          data={therapeuticAssociationResults}
          columnDefs={therapeuticAssociationColDefs.filter((col) => col.headerName !== 'Actions')}
          collapseableCols={['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth', 'comments']}
          fullWidth
        />
      );
    } else {
      therapeuticAssociationSection = (
        <>
          <DataTable
            columnDefs={therapeuticAssociationColDefs}
            rowData={therapeuticAssociationResults}
            canEdit={canEdit}
            collapseColumnFields={['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth', 'comments']}
            onEdit={handleMatchedTumourEditStart}
            isPrint={isPrint}
            isPaginated={!isPrint}
          />
          <RapidVariantEditDialog
            open={showMatchedTumourEditDialog}
            fields={[FIELDS.comments, FIELDS.kbMatches]}
            editData={editData}
            onClose={handleMatchedTumourEditClose}
          />
        </>
      );
    }
  } else {
    therapeuticAssociationSection = (
      <div className="rapid-summary__none">
        No Therapeutic Association in Matched Tumour Type found.
      </div>
    );
  }

  const handleCancerRelevanceEditStart = useCallback((rowData) => {
    setShowCancerRelevanceEventsDialog(true);
    if (rowData) {
      setEditData(rowData);
    }
  }, []);

  const handleCancerRelevanceEditClose = useCallback(async (newData) => {
    setShowCancerRelevanceEventsDialog(false);
    if (newData) {
      try {
        const updateResp = await api.get(`/reports/${report.ident}/variants?rapidTable=cancerRelevance`).request();
        setCancerRelevanceResults(updateResp);
      } catch (e) {
        snackbar.error(`Refetching of cancer relevance data failed: ${e.message ? e.message : e}`);
      } finally {
        setShowCancerRelevanceEventsDialog(false);
      }
    } else {
      setShowCancerRelevanceEventsDialog(false);
    }
  }, [report.ident]);

  let cancerRelevanceSection;
  if (cancerRelevanceResults?.length > 0) {
    if (isPrint) {
      cancerRelevanceSection = (
        <PrintTable
          data={cancerRelevanceResults}
          columnDefs={cancerRelevanceColDefs.filter((col) => col.headerName !== 'Actions')}
          collapseableCols={['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth']}
          fullWidth
        />
      );
    } else {
      cancerRelevanceSection = (
        <>
          <DataTable
            columnDefs={cancerRelevanceColDefs}
            rowData={cancerRelevanceResults}
            canEdit={canEdit}
            collapseColumnFields={['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth']}
            onEdit={handleCancerRelevanceEditStart}
            isPrint={isPrint}
            isPaginated={!isPrint}
          />
          <RapidVariantEditDialog
            open={showCancerRelevanceEventsDialog}
            editData={editData}
            onClose={handleCancerRelevanceEditClose}
          />
        </>
      );
    }
  } else {
    cancerRelevanceSection = (
      <div className="rapid-summary__none">
        No Variants with Cancer Relevance found.
      </div>
    );
  }

  const unknownSignificanceSection = useMemo(() => {
    if (unknownSignificanceResults?.length > 0) {
      const sortedVUS = unknownSignificanceResults.sort(({ displayName: displayNameA }, { displayName: displayNameB }) => {
        if (displayNameA < displayNameB) {
          return -1;
        }
        if (displayNameA > displayNameB) {
          return 1;
        }
        return 0;
      });

      return (
        <section className="rapid-summary__unknown-significance">
          {sortedVUS.map((entry) => (
            <Box
              display="inline-block"
              padding={1}
              minWidth="150px"
              key={entry.ident}
            >
              <Typography variant="h6">
                {getGenomicEvent({ data: entry })}
              </Typography>
            </Box>
          ))}
        </section>
      );
    }
    return (
      <div className="rapid-summary__none">
        No Variants of Uncertain Significance found.
      </div>
    );
  }, [unknownSignificanceResults]);

  const reviewSignaturesSection = useMemo(() => {
    if (!report) return null;
    const component = (
      <div className="rapid-summary__reviews">
        {!isPrint && (
          <Typography variant="h3" className="rapid-summary__reviews-title">
            Reviews
          </Typography>
        )}
        <div className="rapid-summary__signatures">
          {
            signatureTypes.map((sigType) => {
              let title = sigType.signatureType;
              if (sigType.signatureType === 'author') {
                title = isPrint ? 'Manual Review' : 'Ready';
              }
              return (
                <SignatureCard
                  key={sigType.signatureType}
                  onClick={handleSign}
                  signatures={signatures}
                  title={capitalize(title)}
                  type={sigType.signatureType}
                  isPrint={isPrint}
                />
              );
            })
          }
        </div>
      </div>
    );
    return component;
  }, [report, handleSign, isPrint, signatures, signatureTypes]);

  const sampleInfoSection = useMemo(() => {
    if (!report || !report.sampleInfo) { return null; }
    return (
      <div className="rapid-summary__sample-information">
        <Typography variant="h3" display="inline" className="rapid-summary__sample-information-title">
          Sample Information
        </Typography>
        {isPrint ? (
          <PrintTable
            data={report.sampleInfo}
            columnDefs={sampleColumnDefs}
            fullWidth
          />
        ) : (
          <DataTable
            columnDefs={sampleColumnDefs}
            rowData={report.sampleInfo}
            isPrint={isPrint}
            isPaginated={!isPrint}
          />
        )}
      </div>
    );
  }, [report, isPrint]);
  const classNamePrefix = printVersion ? 'rapid-summary--print' : 'rapid-summary';

  const handleTumourSummaryEditClose: TumourSummaryEditProps['onEditClose'] = useCallback((
    isSaved,
    newMicrobialData,
    newReportData,
    newTCellCd8Data,
    newMutationBurdenData,
    newTmBurMutBurData,
    newMsiData,
  ) => {
    if (!isSaved || (!newMicrobialData && !newReportData && !newTCellCd8Data && !newMutationBurdenData && !newTmBurMutBurData && !newMsiData)) {
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
      setMsi(getMostCurrentObj(newMsiData));
    }
  }, [setReport]);

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
                tmburMutBur={tmburMutBur}
                msi={msi}
                tumourSummary={tumourSummary}
              />
            )}
          </Box>
        </Box>
        {report && therapeuticAssociationResults && (
        <div className="rapid-summary__events">
          <Typography className="rapid-summary__events-title" variant="h3" display="inline">
            Variants with Clinical Evidence for Treatment in This Tumour Type
          </Typography>
          {therapeuticAssociationSection}
        </div>
        )}
        {report && cancerRelevanceResults && (
        <div className="rapid-summary__events">
          <Typography className="rapid-summary__events-title" variant="h3" display="inline">
            Variants with Cancer Relevance
          </Typography>
          {cancerRelevanceSection}
        </div>
        )}
        {report && unknownSignificanceResults && (
        <div className="rapid-summary__events">
          <Typography className="rapid-summary__events-title" variant="h3" display="inline">
            Variants of Uncertain Significance
          </Typography>
          {unknownSignificanceSection}
        </div>
        )}
        {
            isPrint ? reviewSignaturesSection : sampleInfoSection
          }
        {
            isPrint ? sampleInfoSection : reviewSignaturesSection
          }
      </div>
    );
  }

  return (
    <div className={`rapid-summary${isPrint ? '--print' : ''}`}>
      {!isLoading && (
        <>
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
              tmburMutBur={tmburMutBur}
              msi={msi}
              tumourSummary={tumourSummary}
            />
          )}
          {report && therapeuticAssociationResults && (
            <div className="rapid-summary__events">
              <Typography className="rapid-summary__events-title" variant="h3" display="inline">
                Variants with Clinical Evidence for Treatment in This Tumour Type
              </Typography>
              {therapeuticAssociationSection}
            </div>
          )}
          {report && cancerRelevanceResults && (
            <div className="rapid-summary__events">
              <Typography className="rapid-summary__events-title" variant="h3" display="inline">
                Variants with Cancer Relevance
              </Typography>
              {cancerRelevanceSection}
            </div>
          )}
          {report && unknownSignificanceResults && (
            <div className="rapid-summary__events">
              <Typography className="rapid-summary__events-title" variant="h3" display="inline">
                Variants of Uncertain Significance
              </Typography>
              {unknownSignificanceSection}
            </div>
          )}
          {
            isPrint ? reviewSignaturesSection : sampleInfoSection
          }
          {
            isPrint ? sampleInfoSection : reviewSignaturesSection
          }
        </>
      )}
    </div>
  );
};

export {
  splitVariantsByRelevance,
  getVariantRelevanceDict,
  processPotentialClinicalAssociation,
  splitIprEvidenceLevels,
};

export default withLoading(RapidSummary);
