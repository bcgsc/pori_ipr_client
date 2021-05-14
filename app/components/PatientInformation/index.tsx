import React, {
  useState, useContext, useCallback, useEffect,
} from 'react';
import {
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import api, { ApiCallSet } from '@/services/api';
import { formatDate } from '@/utils/date';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import EditContext from '@/components/EditContext';
import ReportContext, { PatientInformationType } from '@/components/ReportContext';
import ConfirmContext from '@/components/ConfirmContext';
import PatientEdit from './components/PatientEdit';
import { DisplayValuesType, EditableReportFieldsType } from './types';

import './index.scss';

type PatientInformationProps = {
  isPrint?: boolean;
  patientInfo: PatientInformationType;
};

const PatientInformation = ({
  isPrint = false,
  patientInfo,
}: PatientInformationProps): JSX.Element => {
  const { canEdit } = useContext(EditContext);
  const { isSigned } = useContext(ConfirmContext);
  const { report, setReport } = useContext(ReportContext);

  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [displayValues, setDisplayValues] = useState<DisplayValuesType[]>();

  useEffect(() => {
    setDisplayValues([
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
  }, [report]);

  const handlePatientEditClose = useCallback(async (
    isSaved: boolean,
    newPatientData: PatientInformationType,
    newReportData: EditableReportFieldsType,
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

    setDisplayValues([
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

  return (
    <div className="patient-information">
      <div className="patient-information__title">
        <Typography variant="h3" display="inline">
          Patient Information
          {canEdit && !isPrint && (
            <>
              <IconButton onClick={() => setShowPatientEdit(true)}>
                <EditIcon />
              </IconButton>
              <PatientEdit
                patientInformation={patientInfo}
                report={report}
                isOpen={showPatientEdit}
                onClose={handlePatientEditClose}
              />
            </>
          )}
        </Typography>
      </div>
      {displayValues && (
        <Grid
          alignItems="flex-end"
          container
          spacing={3}
          className="patient-information__content"
        >
          {displayValues.map(({ label, value }) => (
            <Grid key={label} item>
              <ReadOnlyTextField label={label}>
                {value}
              </ReadOnlyTextField>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default PatientInformation;
