import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  Typography,
  IconButton,
  Grid,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import api, { ApiCallSet } from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import { sampleColumnDefs, eventsColumnDefs } from './columnDefs';
import ReportContext from '../../../../components/ReportContext';
import EditContext from '../../../../components/EditContext';
import ConfirmContext from '../../../../components/ConfirmContext';
import ReadOnlyTextField from '../../../../components/ReadOnlyTextField';
import { getSignatures, sign, revokeSignature } from '../../../../services/reports/signatures';
import TargetedGenesService from '../../../../services/reports/targeted-genes.service';
import TestInformationService from '../../../../services/reports/test-information.service';
import { formatDate } from '../../../../utils/date';
import TestInformation from './components/TestInformation';
import SignatureCard from '../../../../components/SignatureCard';
import PatientEdit from '../GenomicSummary/components/PatientEdit';
import EventsEditDialog from './components/EventsEditDialog';
import PrintTable from './components/PrintTable';

import './index.scss';

type ProbeSummaryProps = {
  loadedDispatch: (type: Record<string, unknown>) => void;
  isPrint: boolean;
};

const ProbeSummary = ({
  loadedDispatch,
  isPrint,
}: ProbeSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
  const { isSigned, setIsSigned } = useContext(ConfirmContext);

  const [testInformation, setTestInformation] = useState<Array<TestInformationInterface> | null>();
  const [signatures, setSignatures] = useState<any | null>();
  const [probeResults, setProbeResults] = useState<Array<Record<string, unknown>> | null>();
  const [patientInformation, setPatientInformation] = useState<Array<Record<string, unknown>> | null>();
  const [editData, setEditData] = useState();

  const [showPatientEdit, setShowPatientEdit] = useState<boolean>(false);
  const [showEventsDialog, setShowEventsDialog] = useState<boolean>(false);

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        const [testInformationData, signaturesData, probeResultsData] = await Promise.all([
          TestInformationService.retrieve(report.ident),
          getSignatures(report.ident),
          TargetedGenesService.getAll(report.ident),
        ]);

        setTestInformation(testInformationData);
        setSignatures(signaturesData);
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
            label: 'Sex',
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

  const handlePatientEditClose = useCallback(async (isSaved, newPatientData, newReportData) => {
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
        label: 'Sex',
        value: newPatientData ? newPatientData.gender : report.patientInformation.gender,
      },
    ]);
  }, [isSigned, report, setReport]);

  const handleSign = async (signed: boolean, role: 'author' | 'reviewer') => {
    let newSignature;

    if (signed) {
      newSignature = await sign(report.ident, role);
    } else {
      newSignature = await revokeSignature(report.ident, role);
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
      {report && testInformation && (
        <div className="probe-summary__test-information">
          <Typography variant="h3" className="probe-summary__test-information-title">
            Test Information
          </Typography>
          <TestInformation data={testInformation} />
        </div>
      )}
      {report && probeResults && (
        <>
          <Typography variant="h3" display="inline">
            Genomic Events with Potential Therapeutic Association
          </Typography>
          {probeResults.length ? (
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
          ) : (
            <div className="probe-summary__none">
              No Genomic Events were found
            </div>
          )}
        </>
      )}
      {report && (
        <span className="probe-summary__reviews">
          <Typography variant="h3" className="probe-summary__reviews-title">
            Reviews
          </Typography>
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
