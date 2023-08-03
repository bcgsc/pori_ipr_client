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
  KbMatchType, TumourSummaryType, ImmuneType, MicrobialType, TmburType,
} from '@/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { Box } from '@mui/system';
import {
  therapeuticAssociationColDefs, cancerRelevanceColDefs, sampleColumnDefs, getGenomicEvent,
} from './columnDefs';
import VariantEditDialog from './components/VariantEditDialog';
import { RapidVariantType } from './types';

const splitIprEvidenceLevels = (kbMatches: KbMatchType[]) => {
  const iprRelevanceDict = {
    'IPR-A': new Set(),
    'IPR-B': new Set(),
  };

  const removeSquareBrackets = (kbm: KbMatchType) => {
    iprRelevanceDict[kbm.iprEvidenceLevel].add(kbm.context.replace(/ *\[[^)]*\] */g, '').toLowerCase());
  };

  orderBy(
    kbMatches,
    ['iprEvidenceLevel', 'context'],
  ).forEach(removeSquareBrackets);

  return iprRelevanceDict;
};

const getVariantRelevanceDict = (variant: RapidVariantType) => {
  const relevanceDict: Record<string, KbMatchType[]> = {};
  variant.kbMatches.forEach((match) => {
    if (!relevanceDict[match.relevance]) {
      relevanceDict[match.relevance] = [match];
    } else {
      relevanceDict[match.relevance].push(match);
    }
  });
  return relevanceDict;
};

const processPotentialClinicalAssociation = (variant: RapidVariantType) => Object.entries(getVariantRelevanceDict(variant))
  .map(([relevanceKey, kbMatches]) => {
    const iprEvidenceDict = splitIprEvidenceLevels(kbMatches);

    const combinedDrugList = [
      ...orderBy(
        Array.from(iprEvidenceDict['IPR-A']),
        [(cont) => cont[0].toLowerCase()],
      ).map((drugName) => `${drugName} (IPR-A)`),
      ...orderBy(
        Array.from(iprEvidenceDict['IPR-B']),
        [(cont) => cont[0].toLowerCase()],
      ).filter((drugName) => !iprEvidenceDict['IPR-A'].has(drugName)).map((drugName) => `${drugName} (IPR-B)`),
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
  loadedDispatch: ({ type: string }) => void;
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
          } else if (!isPrint) {
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
    setTumourSummary([
      {
        term: 'Pathology Tumour Content',
        value: `${
          report.sampleInfo.find((samp) => samp?.Sample?.toLowerCase() === 'tumour')['Patho TC'] ?? ''
        }`,
      },
      {
        term: 'M1M2 Score',
        value: report.m1m2Score !== null
          ? `${report.m1m2Score}`
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
  }, [microbial, tmburMutBur, report.m1m2Score, report.sampleInfo, report.tumourContent, tCellCd8?.percentile, tCellCd8?.score]);

  const handlePatientEditClose = useCallback(async (
    isSaved: boolean,
    newPatientData: PatientInformationType,
    newReportData: ReportType,
  ) => {
    const apiCalls = [];
    setShowPatientEdit(false);

    if (!isSaved || (!newPatientData && !newReportData)) {
      return;
    }

    if (newPatientData) {
      apiCalls.push(api.put(`/reports/${report.ident}/patient-information`, newPatientData));
    }

    if (newReportData) {
      apiCalls.push(api.put(`/reports/${report.ident}`, newReportData));
    }

    const callSet = new ApiCallSet(apiCalls);

    if (isSigned) {
      showConfirmDialog(callSet);
    } else {
      const [, reportResp] = await callSet.request() as [unknown, ReportType];

      if (reportResp) {
        setReport({ ...reportResp, ...report });
      }

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
  }, [isSigned, report, setReport, showConfirmDialog]);

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
  ) => {
    setShowTumourSummaryEdit(false);

    if (!isSaved || (!newMicrobialData && !newReportData)) {
      return;
    }

    if (newMicrobialData) {
      setMicrobial(newMicrobialData);
    }

    if (newReportData) {
      setReport(newReportData);
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
                  mutationBurden={null}
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

  const handleMatchedTumourEditClose = useCallback((newData) => {
    setShowMatchedTumourEditDialog(false);

    if (newData) {
      setTherapeuticAssociationResults((existingResults) => {
        const newEvents = cloneDeep(existingResults);
        const eventsIndex = existingResults.findIndex((user) => user.ident.includes(newData.ident));
        if (eventsIndex !== -1) {
          newEvents[eventsIndex] = {
            ...newEvents[eventsIndex],
            comments: newData.comments,
          };
        }
        return newEvents;
      });
    }
  }, []);

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

  const handleCancerRelevanceEditClose = useCallback((newData) => {
    setShowCancerRelevanceEventsDialog(false);
    if (newData) {
      setCancerRelevanceResults((existingResults) => {
        const newEvents = [...existingResults];
        const eventsIndex = existingResults.findIndex((user) => user.ident === newData.ident);
        if (eventsIndex !== -1) {
          newEvents[eventsIndex] = newData;
        }
        return newEvents;
      });
    }
  }, []);

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
      return (
        <Box display="flex" flexDirection="row" flexWrap="wrap" margin="1rem 0 1rem 0">
          {
            (unknownSignificanceResults).map((entry) => (
              <Box
                display="inline-block"
                padding={1}
                minWidth="150px"
                key={entry.ident}
              >
                <Typography variant="h6" fontWeight="fontWeightBold">
                  {getGenomicEvent({ data: entry })}
                </Typography>
              </Box>
            ))
          }
        </Box>
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
