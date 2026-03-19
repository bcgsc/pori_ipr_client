// AUTO-GENERATED — DO NOT EDIT
import {
  useQuery, QueryFunctionContext, QueryKey, UseQueryOptions,
} from 'react-query';
import api from '@/services/api';
import useSecurity from '@/hooks/useSecurity';
import { ErrorMixin } from '@/services/errors/errors';
import { queryKeys } from './queryKeys';

type QueryParams = Record<string, string | number | boolean | undefined>;

type AuthedQueryOptions<TQueryFnData, TData = TQueryFnData> = Partial<
UseQueryOptions<TQueryFnData, Error | ErrorMixin, TData>
> & { queryParams?: QueryParams };

const pathFromQueryKey = (queryKey: string | readonly string[]) => {
  const segments = typeof queryKey === 'string' ? [queryKey] : [...queryKey];
  if (!segments.length) return '/';
  const lastSegment = segments[segments.length - 1];
  const prefixSegments = segments.slice(0, -1);
  const prefix = prefixSegments.map((s) => encodeURIComponent(s)).filter(Boolean).join('/');
  const basePath = prefix ? `/${prefix}` : '';
  if (lastSegment.startsWith('?')) return basePath + lastSegment;
  if (basePath) return `${basePath}/${encodeURIComponent(lastSegment)}`;
  return `/${encodeURIComponent(lastSegment)}`;
};

const buildQueryString = (queryParams?: QueryParams) => {
  if (!queryParams) return '';
  const search = new URLSearchParams(Object.entries(queryParams).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
  return search.toString() ? `?${search.toString()}` : '';
};

const genericFetcher = async <T>({ queryKey }: QueryFunctionContext<QueryKey>) => {
  const data = await api.get(pathFromQueryKey(queryKey as string | readonly string[])).request();
  return data as T;
};

const useAuthedQuery = <TQueryFnData, TData = TQueryFnData>(
  baseKey: readonly string[],
  { queryParams, enabled, ...queryOptions }: AuthedQueryOptions<TQueryFnData, TData> = {},
) => {
  const { authorizationToken } = useSecurity();
  const hasAuthToken = Boolean(authorizationToken);
  const queryString = buildQueryString(queryParams);
  const queryKey = queryString ? [...baseKey, queryString] : [...baseKey];
  return useQuery<TQueryFnData, Error | ErrorMixin, TData>({
    queryKey, queryFn: genericFetcher, enabled: enabled ?? hasAuthToken, ...queryOptions,
  });
};

const useUserAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.user.all(),
    { ...queryOptions, queryParams },
  );

const useUser = <TQueryFnData = unknown, TData = TQueryFnData>(
  userIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.user.user(userIdent),
    { ...queryOptions, queryParams },
  );

const useUserMe = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.user.me(),
    { ...queryOptions, queryParams },
  );

const useUserSettings = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.user.settings(),
    { ...queryOptions, queryParams },
  );

const useUserSearch = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.user.search(),
    { ...queryOptions, queryParams },
  );

const useUserGroup = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.user.group(),
    { ...queryOptions, queryParams },
  );

const useUserGroupGroup = <TQueryFnData = unknown, TData = TQueryFnData>(
  groupIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.user.groupGroup(groupIdent),
    { ...queryOptions, queryParams },
  );

const useUserGroupGroupMember = <TQueryFnData = unknown, TData = TQueryFnData>(
  groupIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.user.groupGroupMember(groupIdent),
    { ...queryOptions, queryParams },
  );

const useReportsAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.all(),
    { ...queryOptions, queryParams },
  );

const useReportPatientInformation = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportPatientInformation(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportMutationBurden = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportMutationBurden(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportMutationBurdenBurden = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  burdenIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportMutationBurdenBurden(reportIdent, burdenIdent),
    { ...queryOptions, queryParams },
  );

const useReportTmburMutationBurden = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportTmburMutationBurden(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSummaryVariantCounts = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSummaryVariantCounts(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSummaryGenomicAlterationsIdentified = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSummaryGenomicAlterationsIdentified(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSummaryGenomicAlterationsIdentifiedAlteration = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  alterationIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSummaryGenomicAlterationsIdentifiedAlteration(reportIdent, alterationIdent),
    { ...queryOptions, queryParams },
  );

const useReportsSchema = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.schema(),
    { ...queryOptions, queryParams },
  );

const useReport = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.report(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportUser = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportUser(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportUserBinding = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  bindingIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportUserBinding(reportIdent, bindingIdent),
    { ...queryOptions, queryParams },
  );

const useReportSummaryMicrobial = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSummaryMicrobial(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportTherapeuticTargets = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportTherapeuticTargets(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportTherapeuticTargetsTherapeuticTarget = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  therapeuticTargetIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportTherapeuticTargetsTherapeuticTarget(reportIdent, therapeuticTargetIdent),
    { ...queryOptions, queryParams },
  );

const useReportSummaryPathwayAnalysis = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSummaryPathwayAnalysis(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportAppendices = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportAppendices(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportAppendicesTcga = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportAppendicesTcga(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportCopyVariants = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportCopyVariants(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportCopyVariantsCnv = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  cnvIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportCopyVariantsCnv(reportIdent, cnvIdent),
    { ...queryOptions, queryParams },
  );

const useReportProteinVariants = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportProteinVariants(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportProteinVariantsProtein = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  proteinIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportProteinVariantsProtein(reportIdent, proteinIdent),
    { ...queryOptions, queryParams },
  );

const useReportExpressionVariants = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportExpressionVariants(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportExpressionVariantsExpression = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  expressionIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportExpressionVariantsExpression(reportIdent, expressionIdent),
    { ...queryOptions, queryParams },
  );

const useReportGenes = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportGenes(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportGenesGeneName = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  geneNameIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportGenesGeneName(reportIdent, geneNameIdent),
    { ...queryOptions, queryParams },
  );

const useReportGeneViewerGeneName = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  geneNameIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportGeneViewerGeneName(reportIdent, geneNameIdent),
    { ...queryOptions, queryParams },
  );

const useReportImage = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportImage(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportImageImage = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  imageIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportImageImage(reportIdent, imageIdent),
    { ...queryOptions, queryParams },
  );

const useReportImageRetrieveKey = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  keyIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportImageRetrieveKey(reportIdent, keyIdent),
    { ...queryOptions, queryParams },
  );

const useReportImageSubtypePlots = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportImageSubtypePlots(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportImageMutationBurden = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportImageMutationBurden(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportImageExpressionDensityGraphs = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportImageExpressionDensityGraphs(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportKbMatches = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportKbMatches(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportKbMatchesKbMatch = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  kbMatchIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportKbMatchesKbMatch(reportIdent, kbMatchIdent),
    { ...queryOptions, queryParams },
  );

const useReportKbMatchesKbMatchedStatements = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportKbMatchesKbMatchedStatements(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportKbMatchesKbMatchedStatementsKbMatchedStatement = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  kbMatchedStatementIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportKbMatchesKbMatchedStatementsKbMatchedStatement(reportIdent, kbMatchedStatementIdent),
    { ...queryOptions, queryParams },
  );

const useReportMavis = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportMavis(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportMutationSignatures = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportMutationSignatures(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportMutationSignaturesMutationSignature = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  mutationSignatureIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportMutationSignaturesMutationSignature(reportIdent, mutationSignatureIdent),
    { ...queryOptions, queryParams },
  );

const useReportPresentationDiscussion = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportPresentationDiscussion(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportPresentationDiscussionDiscussion = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  discussionIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportPresentationDiscussionDiscussion(reportIdent, discussionIdent),
    { ...queryOptions, queryParams },
  );

const useReportPresentationSlide = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportPresentationSlide(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportPresentationSlideSlide = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  slideIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportPresentationSlideSlide(reportIdent, slideIdent),
    { ...queryOptions, queryParams },
  );

const useReportSampleInfo = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSampleInfo(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSampleInfoSampleInfo = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  sampleInfoIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSampleInfoSampleInfo(reportIdent, sampleInfoIdent),
    { ...queryOptions, queryParams },
  );

const useReportProbeResults = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportProbeResults(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportProbeResultsTarget = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  targetIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportProbeResultsTarget(reportIdent, targetIdent),
    { ...queryOptions, queryParams },
  );

const useReportProbeTestInformation = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportProbeTestInformation(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSignatures = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSignatures(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSignaturesSignRole = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  roleIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSignaturesSignRole(reportIdent, roleIdent),
    { ...queryOptions, queryParams },
  );

const useReportSignaturesRevokeRole = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  roleIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSignaturesRevokeRole(reportIdent, roleIdent),
    { ...queryOptions, queryParams },
  );

const useReportSignaturesEarliestSignoff = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSignaturesEarliestSignoff(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSmallMutations = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSmallMutations(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSmallMutationsMutation = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  mutationIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSmallMutationsMutation(reportIdent, mutationIdent),
    { ...queryOptions, queryParams },
  );

const useReportStructuralVariants = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportStructuralVariants(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportStructuralVariantsStructuralVariant = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  structuralVariantIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportStructuralVariantsStructuralVariant(reportIdent, structuralVariantIdent),
    { ...queryOptions, queryParams },
  );

const useReportSignatureVariants = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSignatureVariants(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSignatureVariantsSignatureVariant = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  signatureVariantIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSignatureVariantsSignatureVariant(reportIdent, signatureVariantIdent),
    { ...queryOptions, queryParams },
  );

const useReportSummaryAnalystComments = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSummaryAnalystComments(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportComparators = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportComparators(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportMsi = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportMsi(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportMsiMsi = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  msiIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportMsiMsi(reportIdent, msiIdent),
    { ...queryOptions, queryParams },
  );

const useReportImmuneCellTypes = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportImmuneCellTypes(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportImmuneCellTypesImmuneCellTypes = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  immuneCellTypesIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportImmuneCellTypesImmuneCellTypes(reportIdent, immuneCellTypesIdent),
    { ...queryOptions, queryParams },
  );

const useReportVariants = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportVariants(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSetSummaryTable = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSetSummaryTable(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportSetStatementSummaryTable = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportSetStatementSummaryTable(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportObservedVariantAnnotations = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportObservedVariantAnnotations(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportObservedVariantAnnotationsObservedVariantAnnotation = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  observedVariantAnnotationIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportObservedVariantAnnotationsObservedVariantAnnotation(reportIdent, observedVariantAnnotationIdent),
    { ...queryOptions, queryParams },
  );

const useReportStateHistory = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportStateHistory(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportHlaTypes = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportHlaTypes(reportIdent),
    { ...queryOptions, queryParams },
  );

const useReportHlaTypesHlaType = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  hlaTypeIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reports.reportHlaTypesHlaType(reportIdent, hlaTypeIdent),
    { ...queryOptions, queryParams },
  );

const useReportsAsyncAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reportsAsync.all(),
    { ...queryOptions, queryParams },
  );

const useReportsAsyncReport = <TQueryFnData = unknown, TData = TQueryFnData>(
  reportIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.reportsAsync.report(reportIdent),
    { ...queryOptions, queryParams },
  );

const useProjectAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.project.all(),
    { ...queryOptions, queryParams },
  );

const useProjectReports = <TQueryFnData = unknown, TData = TQueryFnData>(
  projectIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.project.projectReports(projectIdent),
    { ...queryOptions, queryParams },
  );

const useProjectTherapeuticTargets = <TQueryFnData = unknown, TData = TQueryFnData>(
  projectIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.project.projectTherapeuticTargets(projectIdent),
    { ...queryOptions, queryParams },
  );

const useGermlineSmallMutationReportsAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.germlineSmallMutationReports.all(),
    { ...queryOptions, queryParams },
  );

const useGermlineSmallMutationReportsGermline = <TQueryFnData = unknown, TData = TQueryFnData>(
  germlineIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.germlineSmallMutationReports.germline(germlineIdent),
    { ...queryOptions, queryParams },
  );

const useGermlineSmallMutationReportsGermlineReviews = <TQueryFnData = unknown, TData = TQueryFnData>(
  germlineIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.germlineSmallMutationReports.germlineReviews(germlineIdent),
    { ...queryOptions, queryParams },
  );

const useGermlineSmallMutationReportsGermlineReviewsReview = <TQueryFnData = unknown, TData = TQueryFnData>(
  germlineIdent: string,
  reviewIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.germlineSmallMutationReports.germlineReviewsReview(germlineIdent, reviewIdent),
    { ...queryOptions, queryParams },
  );

const useGermlineSmallMutationReportsGermlineVariants = <TQueryFnData = unknown, TData = TQueryFnData>(
  germlineIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.germlineSmallMutationReports.germlineVariants(germlineIdent),
    { ...queryOptions, queryParams },
  );

const useGermlineSmallMutationReportsGermlineVariantsVariant = <TQueryFnData = unknown, TData = TQueryFnData>(
  germlineIdent: string,
  variantIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.germlineSmallMutationReports.germlineVariantsVariant(germlineIdent, variantIdent),
    { ...queryOptions, queryParams },
  );

const useGermlineSmallMutationReportsGermlineUsers = <TQueryFnData = unknown, TData = TQueryFnData>(
  germlineIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.germlineSmallMutationReports.germlineUsers(germlineIdent),
    { ...queryOptions, queryParams },
  );

const useGermlineSmallMutationReportsGermlineUsersBinding = <TQueryFnData = unknown, TData = TQueryFnData>(
  germlineIdent: string,
  bindingIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.germlineSmallMutationReports.germlineUsersBinding(germlineIdent, bindingIdent),
    { ...queryOptions, queryParams },
  );

const useGraphkbAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.graphkb.all(),
    { ...queryOptions, queryParams },
  );

const useGraphkbTargetType = <TQueryFnData = unknown, TData = TQueryFnData>(
  targetTypeIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.graphkb.targetType(targetTypeIdent),
    { ...queryOptions, queryParams },
  );

const useGraphkbEvidenceLevels = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.graphkb.evidenceLevels(),
    { ...queryOptions, queryParams },
  );

const useVariantTextAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.variantText.all(),
    { ...queryOptions, queryParams },
  );

const useVariantText = <TQueryFnData = unknown, TData = TQueryFnData>(
  variantTextIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.variantText.variantText(variantTextIdent),
    { ...queryOptions, queryParams },
  );

const useTemplatesAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.templates.all(),
    { ...queryOptions, queryParams },
  );

const useTemplate = <TQueryFnData = unknown, TData = TQueryFnData>(
  templateIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.templates.template(templateIdent),
    { ...queryOptions, queryParams },
  );

const useTemplateAppendix = <TQueryFnData = unknown, TData = TQueryFnData>(
  templateIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.templates.templateAppendix(templateIdent),
    { ...queryOptions, queryParams },
  );

const useTemplateSignatureTypes = <TQueryFnData = unknown, TData = TQueryFnData>(
  templateIdent: string,
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.templates.templateSignatureTypes(templateIdent),
    { ...queryOptions, queryParams },
  );

const useNotificationAll = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.notification.all(),
    { ...queryOptions, queryParams },
  );

const useNotifications = <TQueryFnData = unknown, TData = TQueryFnData>(
  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>,
  queryParams?: QueryParams,
) => useAuthedQuery<TQueryFnData, TData>(
    queryKeys.notification.notifications(),
    { ...queryOptions, queryParams },
  );

export {
  useUserAll,
  useUser,
  useUserMe,
  useUserSettings,
  useUserSearch,
  useUserGroup,
  useUserGroupGroup,
  useUserGroupGroupMember,
  useReportsAll,
  useReportPatientInformation,
  useReportMutationBurden,
  useReportMutationBurdenBurden,
  useReportTmburMutationBurden,
  useReportSummaryVariantCounts,
  useReportSummaryGenomicAlterationsIdentified,
  useReportSummaryGenomicAlterationsIdentifiedAlteration,
  useReportsSchema,
  useReport,
  useReportUser,
  useReportUserBinding,
  useReportSummaryMicrobial,
  useReportTherapeuticTargets,
  useReportTherapeuticTargetsTherapeuticTarget,
  useReportSummaryPathwayAnalysis,
  useReportAppendices,
  useReportAppendicesTcga,
  useReportCopyVariants,
  useReportCopyVariantsCnv,
  useReportProteinVariants,
  useReportProteinVariantsProtein,
  useReportExpressionVariants,
  useReportExpressionVariantsExpression,
  useReportGenes,
  useReportGenesGeneName,
  useReportGeneViewerGeneName,
  useReportImage,
  useReportImageImage,
  useReportImageRetrieveKey,
  useReportImageSubtypePlots,
  useReportImageMutationBurden,
  useReportImageExpressionDensityGraphs,
  useReportKbMatches,
  useReportKbMatchesKbMatch,
  useReportKbMatchesKbMatchedStatements,
  useReportKbMatchesKbMatchedStatementsKbMatchedStatement,
  useReportMavis,
  useReportMutationSignatures,
  useReportMutationSignaturesMutationSignature,
  useReportPresentationDiscussion,
  useReportPresentationDiscussionDiscussion,
  useReportPresentationSlide,
  useReportPresentationSlideSlide,
  useReportSampleInfo,
  useReportSampleInfoSampleInfo,
  useReportProbeResults,
  useReportProbeResultsTarget,
  useReportProbeTestInformation,
  useReportSignatures,
  useReportSignaturesSignRole,
  useReportSignaturesRevokeRole,
  useReportSignaturesEarliestSignoff,
  useReportSmallMutations,
  useReportSmallMutationsMutation,
  useReportStructuralVariants,
  useReportStructuralVariantsStructuralVariant,
  useReportSignatureVariants,
  useReportSignatureVariantsSignatureVariant,
  useReportSummaryAnalystComments,
  useReportComparators,
  useReportMsi,
  useReportMsiMsi,
  useReportImmuneCellTypes,
  useReportImmuneCellTypesImmuneCellTypes,
  useReportVariants,
  useReportSetSummaryTable,
  useReportSetStatementSummaryTable,
  useReportObservedVariantAnnotations,
  useReportObservedVariantAnnotationsObservedVariantAnnotation,
  useReportStateHistory,
  useReportHlaTypes,
  useReportHlaTypesHlaType,
  useReportsAsyncAll,
  useReportsAsyncReport,
  useProjectAll,
  useProjectReports,
  useProjectTherapeuticTargets,
  useGermlineSmallMutationReportsAll,
  useGermlineSmallMutationReportsGermline,
  useGermlineSmallMutationReportsGermlineReviews,
  useGermlineSmallMutationReportsGermlineReviewsReview,
  useGermlineSmallMutationReportsGermlineVariants,
  useGermlineSmallMutationReportsGermlineVariantsVariant,
  useGermlineSmallMutationReportsGermlineUsers,
  useGermlineSmallMutationReportsGermlineUsersBinding,
  useGraphkbAll,
  useGraphkbTargetType,
  useGraphkbEvidenceLevels,
  useVariantTextAll,
  useVariantText,
  useTemplatesAll,
  useTemplate,
  useTemplateAppendix,
  useTemplateSignatureTypes,
  useNotificationAll,
  useNotifications,
};
