import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  Typography,
} from '@mui/material';
import capitalize from 'lodash/capitalize';
import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import ConfirmContext from '@/context/ConfirmContext';
import SignatureCard, { SignatureType, SignatureUserType } from '@/components/SignatureCard';
import PrintTable from '@/components/PrintTable';
import TestInformation, { TestInformationType } from '@/components/TestInformation';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import EventsEditDialog from '@/components/EventsEditDialog';
import { SmallMutationType } from '@/common';
import { sampleColumnDefs, eventsColumnDefs } from './columnDefs';
import ProbeResultsType from './types.d';

import './index.scss';

import PatientInformation from '../PatientInformation';

type ProbeSummaryProps = {
  loadedDispatch: (type: { type: string }) => void;
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
} & WithLoadingInjectedProps;

const ProbeSummary = ({
  loadedDispatch,
  isLoading,
  isPrint,
  setIsLoading,
  printVersion = null,
}: ProbeSummaryProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  let { canEdit } = useReport();
  if (report.state === 'completed') {
    canEdit = false;
  }
  const { setIsSigned } = useContext(ConfirmContext);

  const [testInformation, setTestInformation] = useState<TestInformationType | null>();
  const [signatures, setSignatures] = useState<SignatureType | null>();
  const [probeResults, setProbeResults] = useState<ProbeResultsType[] | null>();
  const [editData, setEditData] = useState();

  const [showEventsDialog, setShowEventsDialog] = useState(false);

  const classNamePrefix = isPrint ? 'probe-summary--print' : 'probe-summary';

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
          ] = await apiCalls.request() as [
            TestInformationType,
            SignatureType,
            ProbeResultsType[],
            SmallMutationType[],
          ];

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
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
          if (loadedDispatch) {
            loadedDispatch({ type: 'summary-probe' });
          }
        }
      };

      getData();
    }
  }, [loadedDispatch, report, setIsLoading]);

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
      <div className={`${classNamePrefix}__none`}>
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
    <div className={classNamePrefix}>
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
          {report && report.reportSampleInfo && (
            <div className={`${classNamePrefix}__sample-information`}>
              <Typography variant="h3" display="inline" className={`${classNamePrefix}__sample-information-title`}>
                Sample Information
              </Typography>
              {isPrint ? (
                <PrintTable
                  data={report.reportSampleInfo}
                  columnDefs={sampleColumnDefs}
                />
              ) : (
                <DataTable
                  columnDefs={sampleColumnDefs}
                  rowData={report.reportSampleInfo}
                  isPrint={isPrint}
                  isPaginated={!isPrint}
                />
              )}
            </div>
          )}
          {report && probeResults && (
            <div className={`${classNamePrefix}__events`}>
              <Typography className={`${classNamePrefix}__events-title`} variant="h3" display="inline">
                Genomic Events with Potential Therapeutic Association
              </Typography>
              {probeResultSection}
            </div>
          )}
          {report && testInformation && (
            <div className={`${classNamePrefix}__test-information`}>
              <Typography variant="h3" className={`${classNamePrefix}__test-information-title`}>
                Test Information
              </Typography>
              <TestInformation
                data={testInformation}
                isPharmacogenomic={false}
              />
            </div>
          )}
          {report && (
            <div className={`${classNamePrefix}__reviews`}>
              {!isPrint && (
                <Typography variant="h3" className={`${classNamePrefix}__reviews-title`}>
                  Reviews
                </Typography>
              )}
              <div className={`${classNamePrefix}__signatures`}>
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
