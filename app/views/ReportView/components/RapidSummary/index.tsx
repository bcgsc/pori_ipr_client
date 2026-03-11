import React, {
  useState, useEffect, useContext, useCallback, useMemo, useRef,
} from 'react';
import {
  Typography,
} from '@mui/material';
import {
  UseQueryResult, useMutation, useQueries, useQuery, useQueryClient,
} from 'react-query';

import DemoDescription from '@/components/DemoDescription';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable, { DataTableImperativeHandle } from '@/components/DataTable';
import ReportContext, { ReportType } from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import ConfirmContext from '@/context/ConfirmContext';
import SignatureCard from '@/components/SignatureCard';
import PrintTable from '@/components/PrintTable';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import capitalize from 'lodash/capitalize';
import getMostCurrentObj from '@/utils/getMostCurrentObj';
import {
  TumourSummaryType, ImmuneType, MutationBurdenType, MicrobialType, TmburType, MsiType, KbMatchType, KbMatchedStatementType,
  RecordDefaults,
  AnyVariant,
} from '@/common';
import { Box } from '@mui/system';
import { getMicbSiteSummary } from '@/utils/getMicbSiteIntegrationStatusLabel';
import { TumourSummaryEditProps } from '@/components/TumourSummaryEdit';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import useSignatures from '@/hooks/useSignatures';
import { useSignatureTypes } from '@/hooks/useSignatureTypes';
import { deepRemoveDuplicate } from '@/utils/deepRemoveDuplicate';

import {
  therapeuticAssociationColDefs, cancerRelevanceColDefs, sampleColumnDefs, getGenomicEvent,
} from './columnDefs';
import { RapidVariantEditDialog, FIELDS } from './components/RapidVariantEditDialog';
import { RapidVariantType } from './types';
import { RESTRICTED_RELEVANCE_LIST, getVariantRelevanceDict } from './utils';
import PatientInformation from '../PatientInformation';
import TumourSummary from '../TumourSummary';

import './index.scss';
import { UNSPECIFIED_EVIDENCE_LEVEL, extractUUID } from './common';

const ANALYST_DISABLED = 'analyst disabled';

enum RapidSummaryTable {
  THERAPEUTIC_ASSOCIATION = 'therapeuticAssociation',
  CANCER_RELEVANCE = 'cancerRelevance',
  UNKNOWN_SIGNIFICANCE = 'unknownSignificance',
}

const splitIprEvidenceLevels = (kbMatches: KbMatchType[]) => {
  const iprRelevanceDict = {};

  kbMatches.forEach(({ kbMatchedStatements }) => {
    for (const statement of kbMatchedStatements) {
      if (statement.iprEvidenceLevel) {
        if (!iprRelevanceDict[statement.iprEvidenceLevel]) {
          iprRelevanceDict[statement.iprEvidenceLevel] = new Set();
        }
      } else if (!iprRelevanceDict[UNSPECIFIED_EVIDENCE_LEVEL]) {
        iprRelevanceDict[UNSPECIFIED_EVIDENCE_LEVEL] = new Set();
      }
    }
  });

  kbMatches.forEach(({ kbMatchedStatements }: KbMatchType) => {
    // Remove square brackets and add to dictionary
    for (const statement of kbMatchedStatements) {
      if (statement.iprEvidenceLevel && statement.context) {
        iprRelevanceDict[statement.iprEvidenceLevel].add(statement.context.replace(/ *\[[^)]*\] */g, '').toLowerCase());
      } else if (statement.context) {
        iprRelevanceDict[UNSPECIFIED_EVIDENCE_LEVEL].add(statement.context.replace(/ *\[[^)]*\] */g, '').toLowerCase());
      }
    }
  });
  return iprRelevanceDict;
};

const filterNoTableAndByRelevance = (
  variantIdent: RecordDefaults['ident'], // todo add uuid format check
  variantType: RapidVariantType['variantType'], // todo add enum check
  kbMatches: KbMatchType[],
  relevance: KbMatchedStatementType['relevance'],
): KbMatchType[] => kbMatches.map(({ kbMatchedStatements, ...rest }) => ({
  ...rest,
  kbMatchedStatements: kbMatchedStatements
    .filter(
      ({ relevance: statementRelevance }) => statementRelevance === relevance,
    )
    .filter(
      ({ kbData }) => {
        if (!kbData) return true;
        // check if statement is tagged with 'noTable' or a nontherapeutic table;
        // if so, hide it, otherwise display

        // get the current tag
        // (using this tag as the default because an untagged stmt is treated the same way)
        let currentTag = RapidSummaryTable.THERAPEUTIC_ASSOCIATION;
        const rapidReportDict = kbData?.rapidReportTableTag || {};

        if (Object.keys(rapidReportDict).length > 0) {
          for (const key of Object.keys(rapidReportDict)) {
            const variantTypesDict = rapidReportDict[key] || {};
            const variantIdentList = variantType in variantTypesDict
              ? variantTypesDict[variantType]
              : [];
            if (variantIdentList.includes(variantIdent)) {
              currentTag = key as RapidSummaryTable;
            }
          }
        }
        if (currentTag === RapidSummaryTable.THERAPEUTIC_ASSOCIATION) {
          return true;
        }
        return false;
      },
    ),
}));

const filterRestrictedRelevance = (
  kbMatches: KbMatchType[],
  restrictedRelList: KbMatchedStatementType['relevance'][] = RESTRICTED_RELEVANCE_LIST,
) => kbMatches.map(({ kbMatchedStatements, ...rest }) => ({
  ...rest,
  kbMatchedStatements: kbMatchedStatements.filter(({ relevance: statementRelevance }) => !restrictedRelList.includes(statementRelevance)),
}));

type ProcessedTherapeuticAssociationRapidVariantType = RapidVariantType & {
  potentialClinicalAssociation: string;
  relevanceKey: string;
};

/**
 * Splits variants data by relevance, adds extra fields for display purposes
 * potentialClinicalAssociation - shows treatment list
 * @param variant variant
 * @returns processed variants with extra params
 */
const processPotentialClinicalAssociation = (variant: RapidVariantType): ProcessedTherapeuticAssociationRapidVariantType[] => Object.entries(getVariantRelevanceDict(variant.kbMatches))
  .map(([relevanceKey, kbMatches]) => {
    const filteredKbMatches = filterRestrictedRelevance(filterNoTableAndByRelevance(variant.ident, variant.variantType, kbMatches, relevanceKey));
    const iprEvidenceDict = splitIprEvidenceLevels(filteredKbMatches);
    const sortedIprKeys = Object.keys(iprEvidenceDict).sort((a, b) => a.localeCompare(b));
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
      potentialClinicalAssociation: `${relevanceKey}${combinedDrugList ? ` to ${combinedDrugList}` : ''}`,
      relevanceKey, // For filtering out relevance not wanted to be displayed
    });
  })
  .filter(({ relevanceKey }) => !RESTRICTED_RELEVANCE_LIST.includes(relevanceKey));

const splitVariantsByRelevance = (data: RapidVariantType[]): ProcessedTherapeuticAssociationRapidVariantType[] => {
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
  const { isSigned, setIsSigned } = useContext(ConfirmContext);
  const { data: signatures } = useSignatures(report);
  const { data: signatureTypes } = useSignatureTypes(report);
  let { canEdit } = useReport();
  if (report.state === 'completed') {
    canEdit = false;
  }
  const { showConfirmDialog } = useConfirmDialog();
  const queryClient = useQueryClient();

  const [tumourSummary, setTumourSummary] = useState<TumourSummaryType[]>();
  const [editData, setEditData] = useState<RapidVariantType>();
  const [showMatchedTumourEditDialog, setShowMatchedTumourEditDialog] = useState(false);

  const therapeuticAssocTableRef = useRef<DataTableImperativeHandle>();
  const cancerRelTableRef = useRef<DataTableImperativeHandle>();

  const reportIdent = report?.ident;

  const queries = useQueries<
  [
    UseQueryResult<RapidVariantType[]>,
    UseQueryResult<RapidVariantType[]>,
    UseQueryResult<RapidVariantType[]>,
    UseQueryResult<TmburType>,
    UseQueryResult<MsiType>,
    UseQueryResult<ImmuneType | undefined>,
    UseQueryResult<MicrobialType[]>,
  ]
  >(
    [
      {
        queryKey: [RapidSummaryTable.THERAPEUTIC_ASSOCIATION, reportIdent],
        queryFn: (): Promise<RapidVariantType[]> => api
          .get(`/reports/${reportIdent}/variants?rapidTable=${RapidSummaryTable.THERAPEUTIC_ASSOCIATION}`)
          .request(),
        select: (rows: RapidVariantType[]) => splitVariantsByRelevance(rows),
        enabled: !!reportIdent,
        onError: !isPrint ? (err) => snackbar.error(err.content?.error?.message) : undefined,
        refetchOnMount: 'always',
      },

      {
        queryKey: [RapidSummaryTable.CANCER_RELEVANCE, reportIdent],
        queryFn: (): Promise<RapidVariantType[]> => api
          .get(`/reports/${reportIdent}/variants?rapidTable=${RapidSummaryTable.CANCER_RELEVANCE}`)
          .request(),
        enabled: !!reportIdent,
        onError: !isPrint ? (err) => snackbar.error(err.content?.error?.message) : undefined,
        refetchOnMount: 'always',
      },

      {
        queryKey: [RapidSummaryTable.UNKNOWN_SIGNIFICANCE, reportIdent],
        queryFn: (): Promise<RapidVariantType[]> => api
          .get(`/reports/${reportIdent}/variants?rapidTable=${RapidSummaryTable.UNKNOWN_SIGNIFICANCE}`)
          .request(),
        enabled: !!reportIdent,
        select: (data: RapidVariantType[]) => deepRemoveDuplicate(data),
        onError: !isPrint ? (err) => snackbar.error(err.content?.error?.message) : undefined,
        refetchOnMount: 'always',
      },

      {
        queryKey: ['tmbur', reportIdent],
        queryFn: (): Promise<TmburType> => api.get(`/reports/${reportIdent}/tmbur-mutation-burden`).request(),
        enabled: !!reportIdent,
        retry: 1,
        onError: !isPrint ? (err) => {
          // Silent fail not found
          if (err.content.status !== 404) {
            snackbar.error(err.content?.error?.message);
          }
        } : undefined,
        refetchOnMount: 'always',
      },

      {
        queryKey: ['msi', reportIdent],
        queryFn: (): Promise<MsiType[]> => api.get(`/reports/${reportIdent}/msi`).request(),
        select: (rows: MsiType[]) => getMostCurrentObj(rows),
        enabled: !!reportIdent,
        onError: (err) => (!isPrint && err.content?.status !== 404
          ? snackbar.error(err.content?.error?.message)
          : undefined),
        refetchOnMount: 'always',
      },

      {
        queryKey: ['immune', reportIdent],
        queryFn: (): Promise<ImmuneType[]> => api.get(`/reports/${reportIdent}/immune-cell-types`).request(),
        select: (rows: ImmuneType[]) => rows.find(({ cellType }) => cellType === 'T cells CD8'),
        enabled: !!reportIdent,
        onError: !isPrint ? (err) => snackbar.error(err.content?.error?.message) : undefined,
        refetchOnMount: 'always',
      },

      {
        queryKey: ['microbial', reportIdent],
        queryFn: (): Promise<MicrobialType[]> => api.get(`/reports/${reportIdent}/summary/microbial`).request(),
        enabled: !!reportIdent,
        onError: !isPrint ? (err) => snackbar.error(err.content?.error?.message) : undefined,
        refetchOnMount: 'always',
      },
    ],
  );

  const {
    data: primaryBurden,
  } = useQuery<MutationBurdenType | null>({
    queryKey: ['primaryBurden', reportIdent],
    enabled: !!reportIdent,
    queryFn: async () => {
      const resp = await api.get(`/reports/${reportIdent}/mutation-burden`).request();
      if (!resp.length || resp[0].qualitySvCount == null) return null;
      return resp[0];
    },
    onError: (err: Error) => console.error('mutation-burden error', err?.message),
    refetchOnMount: 'always',
  });

  const [
    { data: therapeuticAssociationResults, isSuccess: isTherapAssocSuccess },
    { data: cancerRelevanceResults, isSuccess: isCancerRelSuccess },
    { data: unknownSignificanceResults, isSuccess: isUnknownSigSuccess },
    { data: tmburMutBur },
    { data: msi, isSuccess: isMsiSuccess },
    { data: tCellCd8, isSuccess: isTCellCd8Success },
    { data: microbial, isSuccess: isMicrobialSuccess },
  ] = queries;

  const isLoadingFromQueries = queries.some((q) => q.isLoading);
  const rapidSummarySectionsLoaded = isTherapAssocSuccess && isCancerRelSuccess && isUnknownSigSuccess && isMsiSuccess && isTCellCd8Success && isMicrobialSuccess;

  useEffect(() => {
    if (!isLoadingFromQueries) {
      setIsLoading(false);
    }
  }, [isLoadingFromQueries, setIsLoading]);

  useEffect(() => {
    // MSI score now has 2 possible sources: tmbur and reports_msi due to new tool being able to capture MSI in FFPE samples now.
    // Rapid report will now incorporate both sources to retain information in old reports and use updated msi score in future reports
    let msiScore: null | number;
    if (msi && msi.score !== null) {
      msiScore = msi.score;
    } else if (tmburMutBur && tmburMutBur.msiScore !== null) {
      // eslint-disable-next-line prefer-destructuring
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
      // Check if genomeTmb (new version) exists
      const { genomeTmb } = report;
      
      let tmbDisplayValue = 'No data available';

      if (genomeTmb) {
        tmbDisplayValue = genomeTmb.toFixed(2);
      }
      
      if (tmburMutBur) {
        const { tmbHidden, adjustedTmb } = tmburMutBur;
        if (tmbHidden) {
          tmbDisplayValue = null;
        } else if (adjustedTmb != null) {
          tmbDisplayValue = adjustedTmb.toFixed(2);
        }
      }
      
      return ([
        {
          term: 'Pathology Tumour Content',
          value: `${report.sampleInfo?.find((samp) => samp?.sample?.toLowerCase() === 'tumour')?.pathoTc ?? ''}`,
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
          value: `${msiScore} (${msiScore < 20 ? 'MSS' : 'MSI'})`,
        },
        {
          term: 'HRD Score',
          value: report.hrdScore !== null
            ? `${report.hrdScore}`
            : null,
        },
        {
          term: 'HLA (Normal)',
          value: null,
        },
        {
          term:
            tCellCd8?.pedsScore ? 'Pediatric CD8+ T Cell Score' : 'CD8+ T Cell Score',
          value: tCell,
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
          term: 'M1M2 Score',
          value: report.m1m2Score !== null
            ? `${report.m1m2Score}`
            : null,
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
      ]);
    });
  }, [
    microbial, primaryBurden,
    msi, msi?.score,
    report?.m1m2Score, report?.sampleInfo, report?.tumourContent, report?.genomeTmb, report?.captiv8Score, report?.hrdScore,
    tCellCd8, tCellCd8?.percentile, tCellCd8?.score, tCellCd8?.percentileHidden, tCellCd8?.pedsScoreComment,
    tCellCd8?.pedsScore, tCellCd8?.pedsPercentile,
    tmburMutBur, tmburMutBur?.adjustedTmb, tmburMutBur?.tmbHidden,
  ]);

  useEffect(() => {
    if (loadedDispatch && rapidSummarySectionsLoaded && !isLoadingFromQueries) {
      loadedDispatch({ type: 'summary-rapid' });
    }
  }, [rapidSummarySectionsLoaded, isLoadingFromQueries, loadedDispatch]);

  /**
   * Deletes a whole variant from the first two rapid summary tables, can be expanded to 3rd
   */
  const { mutate: deleteVariantMutation } = useMutation({
    mutationFn: async ({ reportId, variant, rapidSummaryTable }: {
      reportId: ReportType['ident'],
      variant: AnyVariant,
      rapidSummaryTable: RapidSummaryTable,
    }) => {
      const uniqueStatementIdents = [...new Set(variant.kbMatches.flatMap((m) => m.kbMatchedStatements.map((s) => s.ident)))];
      const deleteVariant = api.post(`/reports/${reportId}/variants/set-summary-table`, {
        variantIdent: extractUUID(variant.ident),
        variantType: variant.variantType,
        rapidReportTableTag: 'noTable',
        kbStatementIds: uniqueStatementIdents,
      });

      if (
        rapidSummaryTable === RapidSummaryTable.THERAPEUTIC_ASSOCIATION
        && therapeuticAssocTableRef.current
      ) {
        therapeuticAssocTableRef?.current.showLoading();
      }
      if (
        rapidSummaryTable === RapidSummaryTable.CANCER_RELEVANCE
        && cancerRelTableRef.current
      ) {
        cancerRelTableRef.current.showLoading();
      }

      if (isSigned) {
        await showConfirmDialog(deleteVariant, true, 'Variant Removed');
      } else {
        await deleteVariant.request();
      }
    },
    onSuccess: async (_data, { rapidSummaryTable }) => {
      if (!isSigned) {
        snackbar.success('Variant removed');
      }
      queryClient.refetchQueries({ queryKey: ['report-signatures', reportIdent] });
      await queryClient.refetchQueries({ queryKey: [rapidSummaryTable, reportIdent] });
    },
    onError: (err) => {
      snackbar.error(`Failed to remove variant ${err}`);
    },
    onSettled: (_data, _err, { rapidSummaryTable }) => {
      if (
        rapidSummaryTable === RapidSummaryTable.THERAPEUTIC_ASSOCIATION
        && therapeuticAssocTableRef.current
      ) {
        therapeuticAssocTableRef?.current.hideLoading();
      }
      if (
        rapidSummaryTable === RapidSummaryTable.CANCER_RELEVANCE
        && cancerRelTableRef.current
      ) {
        cancerRelTableRef.current.hideLoading();
      }
    },
  });

  const handleVariantDelete = useCallback((rapidSummaryTable: RapidSummaryTable) => (data) => {
    deleteVariantMutation({ reportId: report.ident, variant: data, rapidSummaryTable });
  }, [deleteVariantMutation, report?.ident]);

  const handleSign = useCallback(async (signed: boolean) => {
    setIsSigned(signed);
    queryClient.refetchQueries({ queryKey: ['report-signatures', reportIdent] });
  }, [reportIdent, queryClient, setIsSigned]);

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
        await queryClient.refetchQueries({ queryKey: [RapidSummaryTable.THERAPEUTIC_ASSOCIATION, reportIdent] });
        setShowMatchedTumourEditDialog(false);
      } catch (e) {
        snackbar.error(`Refetching of therapeutic association data failed: ${e.message ? e.message : e}`);
      }
    } else {
      setShowMatchedTumourEditDialog(false);
    }
  }, [queryClient, reportIdent]);

  let therapeuticAssociationSection;
  if (therapeuticAssociationResults?.length > 0) {
    // Variant level noTable
    const variantLevelEmptyVariants = therapeuticAssociationResults
      .filter(({ observedVariantAnnotation: ova }) => ova?.annotations?.rapidReportTableTag === 'noTable');

    const variantsHasTable = therapeuticAssociationResults
      .filter(({ observedVariantAnnotation: ova }) => ova?.annotations?.rapidReportTableTag !== 'noTable');

    // KbMatchStatement level noTable (all of them)
    // Requires analyst to disable on front-page
    const statementLevelEmptyVariants = variantsHasTable
      .filter((variant, index, arr) => {
        const uuid = extractUUID(variant.ident);
        return arr.findIndex((v) => extractUUID(v.ident) === uuid) === index;
      })
      .filter((variant) => {
        const { ident, variantType } = variant;
        const varIdent = extractUUID(ident);

        const isAllEmpty = variant.kbMatches.every((kbM) => kbM.kbMatchedStatements.every((stmt) => {
          const noTableMap = stmt.kbData.rapidReportTableTag?.noTable;
          return noTableMap?.[variantType]?.includes(varIdent) ?? false;
        }));

        return isAllEmpty;
      })
      .map((variant) => ({
        ...variant,
        potentialClinicalAssociation: ANALYST_DISABLED,
      }));
    const crossedOutVariants = [...statementLevelEmptyVariants, ...variantLevelEmptyVariants];

    const filteredOutEmpty = variantsHasTable
      .filter(
        ({ kbMatches }) => Array.isArray(kbMatches)
        && kbMatches.length > 0
        && kbMatches.some(
          ({ kbMatchedStatements }) => Array.isArray(kbMatchedStatements) && kbMatchedStatements.length > 0,
        ),
      ) as ProcessedTherapeuticAssociationRapidVariantType[];

    // Piggy-back added-in attributes to filter out relevance rows where empty
    // Only shown variants where there's at least one treatment
    const printData = filteredOutEmpty.filter(({ relevanceKey, potentialClinicalAssociation }) => relevanceKey.length !== potentialClinicalAssociation.length);

    // Show valid variants first, then the variants that are disabled
    const webData = [...printData, ...crossedOutVariants];
    if (isPrint) {
      therapeuticAssociationSection = (
        <PrintTable
          data={printData}
          columnDefs={therapeuticAssociationColDefs.filter((col) => col.headerName !== 'Actions')}
          collapseableCols={['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth']}
          fullWidth
        />
      );
    } else {
      therapeuticAssociationSection = (
        <>
          <DataTable
            ref={therapeuticAssocTableRef}
            columnDefs={therapeuticAssociationColDefs}
            rowData={webData}
            canEdit={canEdit}
            canDelete={canEdit}
            onDelete={handleVariantDelete(RapidSummaryTable.THERAPEUTIC_ASSOCIATION)}
            collapseColumnFields={['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth', 'Actions']}
            onEdit={handleMatchedTumourEditStart}
            isPrint={isPrint}
            isPaginated={!isPrint}
            getRowClass={({ data }) => (data.potentialClinicalAssociation === ANALYST_DISABLED ? 'strikeout' : '')} // Decoration for crossed out
          />
          <RapidVariantEditDialog
            open={showMatchedTumourEditDialog}
            fields={[FIELDS.kbMatches]}
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
        <DataTable
          ref={cancerRelTableRef}
          canDelete={canEdit}
          onDelete={handleVariantDelete(RapidSummaryTable.CANCER_RELEVANCE)}
          columnDefs={cancerRelevanceColDefs}
          rowData={cancerRelevanceResults}
          collapseColumnFields={['genomicEvents', 'Alt/Total (Tumour)', 'tumourAltCount/tumourDepth']}
          isPrint={isPrint}
          isPaginated={!isPrint}
        />
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
            signatureTypes?.map((sigType) => {
              let title: string = sigType.signatureType;
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
    // Partial query keys to be refetched
    const keysToRefetch = ['microbial', 'report', 'immune', 'primaryBurden', 'msi'];
    queryClient.refetchQueries({
      predicate: (q) => keysToRefetch.includes(q.queryKey[0] as string),
    });

    if (newReportData) {
      setReport(newReportData);
    }
  }, [queryClient, setReport]);

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
