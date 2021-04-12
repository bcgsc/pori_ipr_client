import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  Typography,
  IconButton,
  Grid,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import api, { ApiCallSet } from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext, { ReportType, PatientInformationType, SampleInfoType } from '@/components/ReportContext';
import EditContext from '@/components/EditContext';
import ConfirmContext from '@/components/ConfirmContext';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import { formatDate } from '@/utils/date';
import SignatureCard, { SignatureType } from '@/components/SignatureCard';
import { sampleColumnDefs, eventsColumnDefs } from './columnDefs';
import TestInformation, { TestInformationType } from './components/TestInformation';
import PatientEdit from '../GenomicSummary/components/PatientEdit';
import EventsEditDialog from './components/EventsEditDialog';
import PrintTable from './components/PrintTable';
import ProbeResultsType from './types.d';

import './index.scss';

type ProbeSummaryProps = {
  loadedDispatch: ({ 'type': string }) => void;
  isPrint: boolean;
};

const ProbeSummary = ({
  loadedDispatch,
  isPrint,
}: ProbeSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
  const { isSigned, setIsSigned } = useContext(ConfirmContext);

  const [testInformation, setTestInformation] = useState<TestInformationType | null>();
  const [signatures, setSignatures] = useState<SignatureType | null>();
  const [probeResults, setProbeResults] = useState<ProbeResultsType[] | null>();
  const [patientInformation, setPatientInformation] = useState<{
    label: string;
    value: string | null;
  }[] | null>();
  const [printEvents, setPrintEvents] = useState([]);
  const [editData, setEditData] = useState();

  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [showEventsDialog, setShowEventsDialog] = useState(false);

  useEffect(() => {
    if (report?.ident) {
      const getData = async () => {
        const apiCalls = new ApiCallSet([
          api.get(`/reports/${report.ident}/probe-test-information`, {}),
          api.get(`/reports/${report.ident}/signatures`, {}),
          api.get(`/reports/${report.ident}/probe-results`, {}),
          api.get(`/reports/${report.ident}/small-mutations`, {}),
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
            if (probe.gene.name === mutation.gene.name) {
              if (probe.sample.includes('DNA')) {
                probe.tumourRefCount = mutation.tumourRefCount;
                probe.tumourAltCount = mutation.tumourAltCount;
              }
              if (probe.sample.includes('RNA')) {
                probe.rnaRefCount = mutation.rnaRefCount;
                probe.rnaAltCount = mutation.rnaAltCount;
              }
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

        if (loadedDispatch) {
          loadedDispatch({ type: 'summary' });
        }
      };

      getData();
    }
  }, [loadedDispatch, report]);

  useEffect(() => {
    if (probeResults && isPrint) {
      setPrintEvents(probeResults.map((probe) => (
        eventsColumnDefs.reduce((accumulator, current) => {
          if (current.field) {
            accumulator[current.field] = probe[current.field];
          }
          return accumulator;
        }, { events: `${probe.gene.name} (${probe.variant})` })
      )));
    }
  }, [probeResults, isPrint]);

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
      apiCalls.push(api.put(`/reports/${report.ident}/patient-information`, newPatientData, {}));
    }

    if (newReportData) {
      apiCalls.push(api.put(`/reports/${report.ident}`, newReportData, {}));
    }

    const callSet = new ApiCallSet(apiCalls);
    const [, reportResp] = await callSet.request(isSigned);

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
  }, [isSigned, report, setReport]);

  const handleSign = async (signed: boolean, role: 'author' | 'reviewer') => {
    let newSignature: SignatureType;

    if (signed) {
      newSignature = await api.put(`/reports/${report.ident}/signatures/sign/${role}`, {}, {}).request();
    } else {
      newSignature = await api.put(`/reports/${report.ident}/signatures/revoke/${role}`, {}, {}).request();
    }

    setIsSigned(signed);
    setSignatures(newSignature);
  };

  const handleEditStart = (rowData) => {
    setShowEventsDialog(true);
    if (rowData) {
      setEditData(rowData);
    }
  };

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

  return (
    <div className="probe-summary">
      {report && patientInformation && (
        <>
          <div className="probe-summary__patient-information">
            <div className="probe-summary__patient-information-title">
              <Typography variant="h3" display="inline">
                Patient Information
                {canEdit && !isPrint && (
                  <>
                    <IconButton onClick={() => setShowPatientEdit(true)}>
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
        </>
      )}
      {report && report.sampleInfo && (
        <>
          <Typography variant="h3" display="inline" className="probe-summary__sample-information-title">
            Sample Information
          </Typography>
          {isPrint ? (
            <PrintTable
              data={report.sampleInfo}
              headers={sampleColumnDefs.map((col) => col.headerName)}
              order={['Sample', 'Sample Name', 'Collection Date', 'Primary Site', 'Biopsy Site', 'Patho TC']}
            />
          ) : (
            <DataTable
              columnDefs={sampleColumnDefs}
              rowData={report.sampleInfo}
              isPrint={isPrint}
              isPaginated={!isPrint}
            />
          )}
        </>
      )}
      {report && probeResults && (
        <>
          <Typography variant="h3" display="inline">
            Genomic Events with Potential Therapeutic Association
          </Typography>
          {probeResults.length ? (
            <>
              {isPrint ? (
                <PrintTable
                  data={printEvents}
                  headers={eventsColumnDefs
                    .filter((col) => col.headerName !== 'Actions')
                    .map((col) => col.headerName)}
                />
              ) : (
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
              )}
            </>
          ) : (
            <div className="probe-summary__none">
              No Genomic Events were found
            </div>
          )}
        </>
      )}
      {report && testInformation && (
        <div className="probe-summary__test-information">
          <Typography variant="h3" className="probe-summary__test-information-title">
            Test Information
          </Typography>
          <TestInformation data={testInformation} />
        </div>
      )}
      {report && (
        <span className="probe-summary__reviews">
          {!isPrint && (
            <Typography variant="h3" className="probe-summary__reviews-title">
              Reviews
            </Typography>
          )}
          <div className={`${isPrint ? 'probe-summary__signatures' : ''}`}>
            <SignatureCard
              title={`${isPrint ? 'Manual Review' : 'Ready'}`}
              signatures={signatures}
              onClick={handleSign}
              type="author"
              isPrint={isPrint}
            />
            <SignatureCard
              title="Reviewer"
              signatures={signatures}
              onClick={handleSign}
              type="reviewer"
              isPrint={isPrint}
            />
          </div>
        </span>
      )}
    </div>
  );
};

export default ProbeSummary;
