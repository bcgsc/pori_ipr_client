import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import capitalize from 'lodash.capitalize';
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
import TestInformation, { TestInformationType } from '@/components/TestInformation';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import PatientEdit from '@/components/PatientEdit';
import { sampleColumnDefs, eventsColumnDefs } from './columnDefs';
import EventsEditDialog from './components/EventsEditDialog';
import ProbeResultsType from './types.d';

import './index.scss';

type ProbeSummaryProps = {
  loadedDispatch: ({ type: string }) => void;
  isPrint: boolean;
} & WithLoadingInjectedProps;

const ProbeSummary = ({
  loadedDispatch,
  isLoading,
  isPrint,
  setIsLoading,
}: ProbeSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { isSigned, setIsSigned } = useContext(ConfirmContext);
  const { canEdit } = useUser();

  const [testInformation, setTestInformation] = useState<TestInformationType | null>();
  const [signatures, setSignatures] = useState<SignatureType | null>();
  const [probeResults, setProbeResults] = useState<ProbeResultsType[] | null>();
  const { showConfirmDialog } = useConfirmDialog();
  const [patientInformation, setPatientInformation] = useState<{
    label: string;
    value: string | null;
  }[] | null>();
  const [editData, setEditData] = useState();

  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [showEventsDialog, setShowEventsDialog] = useState(false);

  useEffect(() => {
    if (report?.ident) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/probe-test-information`),
            api.get(`/reports/${report.ident}/signatures`),
            api.get(`/reports/${report.ident}/probe-results`),
            api.get(`/reports/${report.ident}/small-mutations`),
          ]);
          const [
            testInformationData,
            signaturesData,
            probeResultsData,
            smallMutationsData,
          ] = await apiCalls.request();

          setTestInformation(testInformationData);
          setSignatures(signaturesData);

          probeResultsData.forEach((probe) => {
            smallMutationsData.forEach((mutation) => {
              if (probe.gene.name === mutation.gene.name && probe.variant.includes(mutation.proteinChange)) {
                probe.tumourDna = (mutation.tumourRefCount !== null && mutation.tumourAltCount !== null)
                  ? `${mutation.tumourAltCount}/${mutation.tumourDepth}`
                  : '';
                probe.tumourRna = (mutation.rnaRefCount !== null && mutation.rnaAltCount !== null)
                  ? `${mutation.rnaAltCount}/${mutation.rnaDepth}`
                  : '';

                probe.normalDna = (mutation.normalRefCount !== null && mutation.normalAltCount !== null)
                  ? `${mutation.normalAltCount}/${mutation.normalDepth}`
                  : '';
              }
            });
          });
          setProbeResults(probeResultsData);

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
    let reportResp;

    if (isSigned) {
      showConfirmDialog(callSet);
    } else {
      [, reportResp] = await callSet.request();
    }

    if (reportResp) {
      setReport({ ...reportResp, ...report });
    }

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
  }, [isSigned, report, setReport]);

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

  const handleEditStart = useCallback((rowData) => {
    setShowEventsDialog(true);
    if (rowData) {
      setEditData(rowData);
    }
  }, []);

  const handleEditClose = useCallback((newData) => {
    setShowEventsDialog(false);
    if (newData) {
      const eventsIndex = probeResults.findIndex((user) => user.ident === newData.ident);
      if (eventsIndex !== -1) {
        const newEvents = [...probeResults];
        newEvents[eventsIndex] = newData;
        setProbeResults(newEvents);
      }
    }
  }, [probeResults]);

  let probeResultSection;
  if (probeResults?.length > 0) {
    if (isPrint) {
      probeResultSection = (
        <PrintTable
          data={probeResults}
          columnDefs={eventsColumnDefs.filter((col) => col.headerName !== 'Actions')}
          order={['Genomic Events', 'Sample', 'Alt/Total (Tumour DNA)', 'Alt/Total (Tumour RNA)', 'Alt/Total (Normal DNA)', 'Comments']}
        />
      );
    } else {
      probeResultSection = (
        <>
          <DataTable
            columnDefs={eventsColumnDefs}
            rowData={probeResults}
            canEdit={canEdit}
            onEdit={handleEditStart}
            isPrint={isPrint}
            isPaginated={!isPrint}
          />
          <EventsEditDialog
            isOpen={showEventsDialog}
            editData={editData}
            onClose={handleEditClose}
          />
        </>
      );
    }
  } else {
    probeResultSection = (
      <div className="probe-summary__none">
        No Genomic Events were found
      </div>
    );
  }

  const reviewSignatures = useMemo(() => {
    let order: SignatureUserType[] = ['author', 'reviewer', 'creator'];
    if (isPrint) {
      order = ['creator', 'author', 'reviewer'];
    }
    return order.map((sigType) => {
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
    });
  }, [handleSign, isPrint, signatures]);

  return (
    <div className="probe-summary">
      {!isLoading && (
        <>
          {report && patientInformation && (
            <div className="probe-summary__patient-information">
              <div className="probe-summary__patient-information-title">
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
                className="probe-summary__patient-information-content"
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
          {report && report.sampleInfo && (
            <div className="probe-summary__sample-information">
              <Typography variant="h3" display="inline" className="probe-summary__sample-information-title">
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
          )}
          {report && probeResults && (
            <div className="probe-summary__events">
              <Typography className="probe-summary__events-title" variant="h3" display="inline">
                Genomic Events with Potential Therapeutic Association
              </Typography>
              {probeResultSection}
            </div>
          )}
          {report && testInformation && (
            <div className="probe-summary__test-information">
              <Typography variant="h3" className="probe-summary__test-information-title">
                Test Information
              </Typography>
              <TestInformation
                data={testInformation}
                isPharmacogenomic={false}
              />
            </div>
          )}
          {report && (
            <div className="probe-summary__reviews">
              {!isPrint && (
                <Typography variant="h3" className="probe-summary__reviews-title">
                  Reviews
                </Typography>
              )}
              <div className="probe-summary__signatures">
                {reviewSignatures}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(ProbeSummary);
