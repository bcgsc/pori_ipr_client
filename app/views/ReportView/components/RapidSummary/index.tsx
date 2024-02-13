import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import cloneDeep from 'lodash/cloneDeep';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import ReportContext, { ReportType, PatientInformationType } from '@/context/ReportContext';
import { useUser } from '@/context/UserContext';
import ConfirmContext from '@/context/ConfirmContext';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import { formatDate } from '@/utils/date';
import SignatureCard, { SignatureType, SignatureUserType } from '@/components/SignatureCard';
import PrintTable from '@/components/PrintTable';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import PatientEdit from '@/components/PatientEdit';
import capitalize from 'lodash/capitalize';
import orderBy from 'lodash/orderBy';

import './index.scss';
import TumourSummaryEdit from '@/components/TumourSummaryEdit';
import DescriptionList from '@/components/DescriptionList';
import {
  KbMatchType, TumourSummaryType, ImmuneType, MutationBurdenType, MicrobialType, TmburType,
} from '@/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { Box } from '@mui/system';
import {
  therapeuticAssociationColDefs, cancerRelevanceColDefs, sampleColumnDefs, getGenomicEvent,
} from './columnDefs';
import { VariantEditDialog, FIELDS } from './components/VariantEditDialog';
import { RapidVariantType } from './types';
import { getVariantRelevanceDict } from './utils';

const splitIprEvidenceLevels = (kbMatches: KbMatchType[]) => {
  const iprRelevanceDict = {};

  kbMatches.forEach(({ iprEvidenceLevel }) => {
    if (!iprRelevanceDict[iprEvidenceLevel]) {
      iprRelevanceDict[iprEvidenceLevel] = new Set();
    }
  });

  orderBy(
    kbMatches,
    ['iprEvidenceLevel', 'context'],
  ).forEach(({ iprEvidenceLevel, context }: KbMatchType) => {
    // Remove square brackets and add to dictionary
    if (iprEvidenceLevel && context) {
      iprRelevanceDict[iprEvidenceLevel].add(context.replace(/ *\[[^)]*\] */g, '').toLowerCase());
    }
  });

  return iprRelevanceDict;
};

const processPotentialClinicalAssociation = (variant: RapidVariantType) => Object.entries(getVariantRelevanceDict(variant.kbMatches))
  .map(([relevanceKey, kbMatches]) => {
    const iprEvidenceDict = splitIprEvidenceLevels(kbMatches);

    if (!iprEvidenceDict['IPR-A']) {
      iprEvidenceDict['IPR-A'] = new Set();
    }
    if (!iprEvidenceDict['IPR-B']) {
      iprEvidenceDict['IPR-B'] = new Set();
    }

    const iprAArr = Array.from(iprEvidenceDict['IPR-A']);
    const iprBArr = Array.from(iprEvidenceDict['IPR-B']);

    let iprAlist = [];
    if (iprAArr.length > 0) {
      iprAlist = orderBy(
        iprAArr,
        [(cont) => cont[0].toLowerCase()],
      ).map((drugName) => `${drugName} (IPR-A)`);
    }

    let iprBlist = [];
    if (iprBArr.length > 0) {
      iprBlist = orderBy(
        iprBArr,
        [(cont) => cont[0].toLowerCase()],
      ).filter((drugName) => !iprEvidenceDict['IPR-A'].has(drugName)).map((drugName) => `${drugName} (IPR-B)`);
    }

    const combinedDrugList = [
      ...iprAlist,
      ...iprBlist,
    ].join(', ');

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
} & WithLoadingInjectedProps;

const RapidSummary = ({
  loadedDispatch,
  isLoading,
  isPrint = false,
  setIsLoading,
}: RapidSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { isSigned, setIsSigned } = useContext(ConfirmContext);
  const { canEdit } = useUser();
  const { showConfirmDialog } = useConfirmDialog();

  const [signatures, setSignatures] = useState<SignatureType | null>();
  const [therapeuticAssociationResults, setTherapeuticAssociationResults] = useState<RapidVariantType[] | null>();
  const [cancerRelevanceResults, setCancerRelevanceResults] = useState<RapidVariantType[] | null>();
  const [unknownSignificanceResults, setUnknownSignificanceResults] = useState<RapidVariantType[] | null>();
  const [patientInformation, setPatientInformation] = useState<{
    label: string;
    value: string | null;
  }[] | null>();
  const [tumourSummary, setTumourSummary] = useState<TumourSummaryType[]>();
  const [primaryBurden, setPrimaryBurden] = useState<MutationBurdenType>();
  const [tmburMutBur, setTmburMutBur] = useState<TmburType>();
  const [tCellCd8, setTCellCd8] = useState<ImmuneType>();
  const [microbial, setMicrobial] = useState<MicrobialType[]>();
  const [editData, setEditData] = useState();

  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [showTumourSummaryEdit, setShowTumourSummaryEdit] = useState(false);
  const [showMatchedTumourEditDialog, setShowMatchedTumourEditDialog] = useState(false);
  const [showCancerRelevanceEventsDialog, setShowCancerRelevanceEventsDialog] = useState(false);

  useEffect(() => {
    if (report?.ident) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/signatures`),
            api.get(`/reports/${report.ident}/variants?rapidTable=therapeuticAssociation`),
            api.get(`/reports/${report.ident}/variants?rapidTable=cancerRelevance`),
            api.get(`/reports/${report.ident}/variants?rapidTable=unknownSignificance`),
            api.get(`/reports/${report.ident}/tmbur-mutation-burden`),
            api.get(`/reports/${report.ident}/immune-cell-types`),
            api.get(`/reports/${report.ident}/summary/microbial`),
          ]);
          const [
            signaturesResp,
            therapeuticAssociationResp,
            cancerRelevanceResp,
            unknownSignificanceResp,
            tmBurdenResp,
            immuneResp,
            microbialResp,
          ] = await apiCalls.request(true) as [
            PromiseSettledResult<SignatureType>,
            PromiseSettledResult<RapidVariantType[]>,
            PromiseSettledResult<RapidVariantType[]>,
            PromiseSettledResult<RapidVariantType[]>,
            PromiseSettledResult<TmburType>,
            PromiseSettledResult<ImmuneType[]>,
            PromiseSettledResult<MicrobialType[]>,
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
              label: 'Gender',
              value: report.patientInformation.gender,
            },
            {
              label: 'Tumour type for matching',
              value: report.kbDiseaseMatch,
            },
          ]);
        } catch (err) {
          snackbar.error(`Unknown error: ${err}`);
          console.error(err);
        } finally {
          setIsLoading(false);
          if (loadedDispatch) {
            loadedDispatch({ type: 'summary' });
          }
        }
      };

      getData();
    }
  }, [loadedDispatch, report, setIsLoading, isPrint]);

  useEffect(() => {
    let msiStatus: null | string;
    if (tmburMutBur) {
      const { msiScore } = tmburMutBur;
      if (msiScore < 20) {
        msiStatus = 'MSS';
      }
      if (msiScore >= 20) {
        msiStatus = 'MSI';
      }
    } else {
      msiStatus = null;
    }

    let svBurden: null | string;
    if (primaryBurden && primaryBurden.qualitySvCount !== null) {
      svBurden = `${primaryBurden.qualitySvCount} ${primaryBurden.qualitySvPercentile ? `(${primaryBurden.qualitySvPercentile}%)` : ''}`;
    } else {
      svBurden = null;
    }

    setTumourSummary([
      {
        term: 'Pathology Tumour Content',
        value: `${
          report.sampleInfo?.find((samp) => samp?.Sample?.toLowerCase() === 'tumour')['Patho TC'] ?? ''
        }`,
      },
      {
        term: 'M1M2 Score',
        value: report.m1m2Score !== null
          ? `${report.m1m2Score}`
          : null,
      },
      {
        term: 'CAPTIV-8 Score',
        value: report.captiv8Score !== null
          ? `${report.captiv8Score}`
          : null,
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
        value: typeof tCellCd8?.score === 'number'
          ? `${tCellCd8.score} ${tCellCd8.percentile ? `(${tCellCd8.percentile}%)` : ''}`
          : null,
      },
      {
        term: 'SV Burden (POG Average)',
        value: svBurden,
      },
      {
        term: 'Genome TMB (mut/mb)',
        value: tmburMutBur
          ? `${parseFloat((tmburMutBur.genomeSnvTmb + tmburMutBur.genomeIndelTmb).toFixed(12))}`
          : null,
      },
      {
        term: 'MSI Status',
        value: msiStatus,
      },
    ]);
  }, [microbial, primaryBurden, tmburMutBur, report.m1m2Score, report.sampleInfo, report.tumourContent, tCellCd8?.percentile, tCellCd8?.score, report.captiv8Score]);

  const handlePatientEditClose = useCallback((
    // TODO: Argument not being used, leading to OnClose flag on line 744 having too few arguments
    isSaved: boolean,
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
        {
          label: 'Tumour type for matching',
          value: newReportData ? newReportData.kbDiseaseMatch : report.kbDiseaseMatch,
        },
      ]);
    }
  }, [report, setReport]);

  const handleSign = useCallback((signed: boolean, role: SignatureUserType) => {
    let cancelled;
    const sign = async (s: boolean, r: SignatureUserType) => {
      let newSignature;
      if (s) {
        newSignature = await api.put(`/reports/${report.ident}/signatures/sign/${r}`, {}).request();
      } else {
        newSignature = await api.put(`/reports/${report.ident}/signatures/revoke/${r}`, {}).request();
      }
      if (!cancelled) {
        setIsSigned(signed);
        setSignatures(newSignature);
      }
    };
    sign(signed, role);
    return function cleanup() { cancelled = true; };
  }, [report.ident, setIsSigned]);

  const handleTumourSummaryEditClose = useCallback((
    isSaved,
    newMicrobialData,
    newReportData,
    newMutationBurdenData: MutationBurdenType,
    newTmBurMutBurData,
  ) => {
    setShowTumourSummaryEdit(false);

    if (!isSaved || (!newMicrobialData && !newReportData && !newMutationBurdenData && !newTmBurMutBurData)) {
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

    if (newTmBurMutBurData) {
      setTmburMutBur(newTmBurMutBurData);
    }
  }, [setReport]);

  let tumourSummarySection = null;
  if (tumourSummary) {
    tumourSummarySection = (
      <>
        <div className="rapid-summary__tumour-summary-title">
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
                  tmburMutBur={tmburMutBur}
                  isOpen={showTumourSummaryEdit}
                  onClose={handleTumourSummaryEditClose}
                />
              </>
            )}
          </Typography>
        </div>
        <div className="rapid-summary__tumour-summary-content">
          <DescriptionList entries={tumourSummary} />
        </div>
      </>
    );
  }

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
          <VariantEditDialog
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
          <VariantEditDialog
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
    let order: SignatureUserType[] = ['author', 'reviewer', 'creator'];
    if (isPrint) {
      order = ['creator', 'author', 'reviewer'];
    }
    const component = (
      <div className="rapid-summary__reviews">
        {!isPrint && (
          <Typography variant="h3" className="rapid-summary__reviews-title">
            Reviews
          </Typography>
        )}
        <div className="rapid-summary__signatures">
          {
            order.map((sigType) => {
              let title: string = sigType;
              if (sigType === 'author') {
                title = isPrint ? 'Manual Review' : 'Ready';
              }
              return (
                <SignatureCard
                  key={sigType}
                  onClick={handleSign}
                  signatures={signatures}
                  title={capitalize(title)}
                  type={sigType}
                  isPrint={isPrint}
                />
              );
            })
          }
        </div>
      </div>
    );
    return component;
  }, [report, handleSign, isPrint, signatures]);

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

  return (
    <div className={`rapid-summary${isPrint ? '--print' : ''}`}>
      {!isLoading && (
        <>
          {report && patientInformation && (
            <div className="rapid-summary__patient-information">
              <div className="rapid-summary__patient-information-title">
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
                className="rapid-summary__patient-information-content"
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
          )}
          {report && tumourSummary && (
            <div className="rapid-summary__tumour-summary">
              {tumourSummarySection}
            </div>
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
