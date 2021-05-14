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
import PrintTable from '@/components/PrintTable';
import PatientInformation from '@/components/PatientInformation';
import { sampleColumnDefs, eventsColumnDefs } from './columnDefs';
import TestInformation, { TestInformationType } from './components/TestInformation';
import PatientEdit from '../../../../components/PatientInformation/components/PatientEdit';
import EventsEditDialog from './components/EventsEditDialog';
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
  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
  const { setIsSigned } = useContext(ConfirmContext);

  const [testInformation, setTestInformation] = useState<TestInformationType | null>();
  const [signatures, setSignatures] = useState<SignatureType | null>();
  const [probeResults, setProbeResults] = useState<ProbeResultsType[] | null>();
  const [printEvents, setPrintEvents] = useState([]);
  const [editData, setEditData] = useState();

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
              if (mutation.tumourRefCount !== null || mutation.tumourAltCount !== null) {
                probe.tumourDna = `${mutation.tumourRefCount}/${mutation.tumourAltCount}`;
              }
              if (mutation.rnaRefCount !== null || mutation.rnaAltCount !== null) {
                probe.tumourRna = `${mutation.rnaRefCount}/${mutation.rnaAltCount}`;
              }
              if (mutation.normalRefCount !== null || mutation.normalAltCount !== null) {
                probe.normalDna = `${mutation.normalRefCount}/${mutation.normalAltCount}`;
              }
            }
          });
        });
        setProbeResults(probeResultsData);

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
      {report?.patientInformation && (
        <PatientInformation
          isPrint={isPrint}
          patientInfo={report.patientInformation}
        />
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
          {probeResults.length ? (
            <>
              {isPrint ? (
                <PrintTable
                  data={printEvents}
                  columnDefs={eventsColumnDefs
                    .filter((col) => col.headerName !== 'Actions')}
                  order={['Genomic Events', 'Sample', 'Ref/Alt (Tumour DNA)', 'Ref/Alt (Tumour RNA)', 'Ref/Alt (Normal DNA)', 'Comments']}
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
        </div>
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
