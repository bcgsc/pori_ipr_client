import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

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
import EventsEditDialog from '@/components/EventsEditDialog';
import capitalize from 'lodash/capitalize';
import sortedUniqBy from 'lodash/uniqBy';
import get from 'lodash/get';

import './index.scss';
import TumourSummaryEdit from '@/components/TumourSummaryEdit';
import DescriptionList from '@/components/DescriptionList';
import { KbMatchType, TumourSummaryType } from '@/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { clinicalAssociationColDefs, cancerRelevanceColDefs, sampleColumnDefs } from './columnDefs';
import { TmburType } from '../MutationBurden/types';

function getUniqueRecordsByFields<Row>(records: Row[], fields: string[]) {
  // Sort Rows
  const sorted = records.sort((a, b) => {
    const aKey = fields.map((field) => get(a, field)).join('');
    const bKey = fields.map((field) => get(b, field)).join('');
    if (aKey < bKey) { return -1; }
    if (aKey > bKey) { return 1; }
    return 0;
  });
  return sortedUniqBy(sorted, (entry) => fields.map((f) => get(entry, f)).join());
}

/**
 * TODO: Fix this up as updates come in
 * Patient Info (obtained by report)
 * Tumour Summary (aggregate)
 *    Initial tumour content (report.tumourContent?)
 *    Mutation burden (/mutation-burden)
 * Genomic Events with Potential Clinical Association (unknown)
 * Genomic Events with Potential Cancer Relevance (unknown)
 * Other Variants in Cancer Related Genes (unknown)
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
  const [therapeuticAssociationResults, setTherapeuticAssociationResults] = useState<KbMatchType[] | null>();
  const [cancerRelevanceResults, setCancerRelevanceResults] = useState<KbMatchType[] | null>();
  const [patientInformation, setPatientInformation] = useState<{
    label: string;
    value: string | null;
  }[] | null>();
  const [tumourSummary, setTumourSummary] = useState<TumourSummaryType[]>();
  const [mutationBurden, setMutationBurden] = useState<TmburType>();
  const [editData, setEditData] = useState();

  // TODO: awaiting orders
  // const [otherMutationsResults, setOtherMutationsResults] = useState(null);

  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [showTumourSummaryEdit, setShowTumourSummaryEdit] = useState(false);
  const [showClinicalAssociationEventsDialog, setShowClinicalAssociationEventsDialog] = useState(false);
  const [showCancerRelevanceEventsDialog, setShowCancerRelevanceEventsDialog] = useState(false);

  useEffect(() => {
    if (report?.ident) {
      const getData = async () => {
        try {
          // Small mutation, copy number, sv, tmb needed
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/signatures`),
            api.get(`/reports/${report.ident}/kb-matches?rapidTable=therapeuticAssociation`),
            api.get(`/reports/${report.ident}/kb-matches?rapidTable=cancerRelevance`),
            api.get(`/reports/${report.ident}/tmbur-mutation-burden`),
            // TODO?: api.get(`/reports/${report.ident}/small-mutations`),
            // TODO:  api.get(`/reports/${report.ident}/other-mutations`),
          ]);
          const [
            signaturesData,
            therapeuticAssociationData,
            cancerRelevanceData,
            burdenData,
            // TODO: smallMutationsData,
            // TODO: otherMutationsData,
          ] = await apiCalls.request() as [
            SignatureType,
            KbMatchType[],
            KbMatchType[],
            TmburType,
          ];

          setSignatures(signaturesData);

          // TODO: not sure about small mutations yet
          // rapidResultsData.forEach((rapid) => {
          //   // TODO: placeholder, probe report builds probe results with small-mutation calls
          //   smallMutationsData.forEach((mutation) => { });
          // });
          setTherapeuticAssociationResults(getUniqueRecordsByFields(therapeuticAssociationData, [
            'kbVariant',
            'variant.tumourAltCount',
            'variant.tumourDepth',
            'relevance',
          ]));
          setCancerRelevanceResults(getUniqueRecordsByFields(cancerRelevanceData, [
            'kbVariant',
            'variant.tumourAltCount',
            'variant.tumourDepth',
          ]));
          setMutationBurden(burdenData);
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
          ]);

          // setOtherMutationsResults(otherMutationsData);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
          if (loadedDispatch) {
            loadedDispatch({ type: 'summary' });
          }
        }
      };

      getData();
    }
  }, [loadedDispatch, report, setIsLoading]);

  useEffect(() => {
    let msiStatus: null | string;
    if (mutationBurden) {
      const { msiScore } = mutationBurden;
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
        term: 'Initial Tumour Content',
        value: `${report.tumourContent}%`,
      },
      {
        term: 'Mutation Burden',
        value: mutationBurden
          ? `${parseFloat((mutationBurden.genomeSnvTmb + mutationBurden.genomeIndelTmb).toFixed(12))} mut/Mb`
          : null,
      },
      {
        term: 'MSI Status',
        value: msiStatus,
      },
    ]);
  }, [mutationBurden, report.tumourContent]);

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
    newMutationBurdenData,
  ) => {
    setShowTumourSummaryEdit(false);

    if (!isSaved || (!newMicrobialData && !newReportData && !newMutationBurdenData)) {
      return;
    }

    if (newReportData) {
      setReport(newReportData);
    }

    if (newMutationBurdenData) {
      setMutationBurden(newMutationBurdenData);
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
                  microbial={null}
                  report={report}
                  mutationBurden={mutationBurden}
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

  const handleClinicalAssociationEditStart = useCallback((rowData) => {
    setShowClinicalAssociationEventsDialog(true);
    if (rowData) {
      setEditData(rowData);
    }
  }, []);

  const handleClinicalAssociationEditClose = useCallback((newData) => {
    setShowClinicalAssociationEventsDialog(false);
    if (newData) {
      setTherapeuticAssociationResults((existingResults) => {
        const newEvents = [...existingResults];
        const eventsIndex = existingResults.findIndex((user) => user.ident === newData.ident);
        if (eventsIndex !== -1) {
          newEvents[eventsIndex] = newData;
        }
        return newEvents;
      });
    }
  }, []);

  let clinicalAssociationSection;
  if (therapeuticAssociationResults?.length > 0) {
    if (isPrint) {
      clinicalAssociationSection = (
        <PrintTable
          data={therapeuticAssociationResults}
          columnDefs={clinicalAssociationColDefs.filter((col) => col.headerName !== 'Actions')}
        />
      );
    } else {
      clinicalAssociationSection = (
        <>
          <DataTable
            columnDefs={clinicalAssociationColDefs}
            rowData={therapeuticAssociationResults}
            canEdit={canEdit}
            onEdit={handleClinicalAssociationEditStart}
            isPrint={isPrint}
            isPaginated={!isPrint}
          />
          <EventsEditDialog
            isOpen={showClinicalAssociationEventsDialog}
            editData={editData}
            onClose={handleClinicalAssociationEditClose}
          />
        </>
      );
    }
  } else {
    clinicalAssociationSection = (
      <div className="rapid-summary__none">
        No Genomic Events with Potential Clinical Association were found.
      </div>
    );
  }

  const handleCancerRelevanceEditStart = useCallback((rowData) => {
    setShowClinicalAssociationEventsDialog(true);
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
  if (therapeuticAssociationResults?.length > 0) {
    if (isPrint) {
      cancerRelevanceSection = (
        <PrintTable
          data={cancerRelevanceResults}
          columnDefs={cancerRelevanceColDefs.filter((col) => col.headerName !== 'Actions')}
        />
      );
    } else {
      cancerRelevanceSection = (
        <>
          <DataTable
            columnDefs={cancerRelevanceColDefs}
            rowData={cancerRelevanceResults}
            canEdit={canEdit}
            onEdit={handleCancerRelevanceEditStart}
            isPrint={isPrint}
            isPaginated={!isPrint}
          />
          <EventsEditDialog
            isOpen={showCancerRelevanceEventsDialog}
            editData={editData}
            onClose={handleCancerRelevanceEditClose}
          />
        </>
      );
    }
  } else {
    cancerRelevanceSection = (
      <div className="rapid-summary__none">
        No Genomic Events with Potential Cancer Relevance found.
      </div>
    );
  }

  // TODO: No need for this table yet
  // const otherVariantsSection = useMemo(() => (
  //   <Grid container spacing={1} direction="row">
  //     {otherMutationsResults?.map((result) => <Grid xs={4} md={2} item>{result}</Grid>)}
  //   </Grid>
  // ), [otherMutationsResults]);

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
    <div className="rapid-summary">
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
                Genomic Events with Clinical Association
              </Typography>
              {clinicalAssociationSection}
            </div>
          )}
          {report && cancerRelevanceResults && (
            <div className="rapid-summary__events">
              <Typography className="rapid-summary__events-title" variant="h3" display="inline">
                Genomic Events with Cancer Relevance
              </Typography>
              {cancerRelevanceSection}
            </div>
          )}
          {/* {report && otherVariantsResults && (
            <div className="rapid-summary__events">
              <Typography className="rapid-summary__events-title" variant="h3" display="inline">
                Other Variants in Cancer-Related Genes
              </Typography>
              {otherVariantsSection}
            </div>
          )} */}
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

export default withLoading(RapidSummary);
