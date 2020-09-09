import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Typography,
  IconButton,
  Grid,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import ReportContext from '../../../../components/ReportContext';
import EditContext from '../../../../components/EditContext';
import ReadOnlyTextField from '../../../../components/ReadOnlyTextField';
import { getSignatures, sign, revokeSignature } from '../../../../services/reports/signatures';
import PatientInformationService from '../../../../services/reports/patient-information.service';
import ReportService from '../../../../services/reports/report.service';
import TargetedGenesService from '../../../../services/reports/targeted-genes.service';
import GeneService from '../../../../services/reports/gene.service';
import TestInformationService from '../../../../services/reports/test-information.service';
import { formatDate } from '../../../../utils/date';
import PatientEdit from '../GenomicSummary/components/PatientEdit';

import './index.scss';

type Props = {
  loadedDispatch: Function,
  isPrint: boolean,
};

const ProbeSummary: React.FC<Props> = ({
  loadedDispatch,
  isPrint,
}) => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);

  const [testInformation, setTestInformation] = useState<Array<Object> | null>();
  const [signatures, setSignatures] = useState<Array<Object> | null>();
  const [probeResults, setProbeResults] = useState<Array<Object> | null>();
  const [patientInformation, setPatientInformation] = useState<Array<Object> | null>();

  const [showPatientEdit, setShowPatientEdit] = useState<Boolean>(false);

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
      }

      getData();
    }
  }, [report]);

  const handlePatientEditClose = useCallback(async (isSaved, newPatientData, newReportData) => {
    setShowPatientEdit(false);
    if (!isSaved || !newPatientData && !newReportData) {
      return;
    }

    if (newPatientData) {
      await PatientInformationService.update(report.ident, newPatientData);
    }

    if (newReportData) {
      await ReportService.updateReport(report.ident, newReportData);
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
  }, [report]);


  return (
    <div className="probe-summary">
      {report && patientInformation && (
        <>
          <div className="probe-summary__patient-information">
            <div className="probe-summary__patient-information-title">
              <Typography variant="h3" dislay="inline">
                Patient Information
                {canEdit && (
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
              className="genomic-summary__patient-information-content"
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
    </div>
  );
};

export default ProbeSummary;
