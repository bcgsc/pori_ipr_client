import React, {
  useState, useEffect, useCallback, useContext,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Button,
  TextFieldProps,
} from '@mui/material';

import api, { ApiCallSet } from '@/services/api';
import ConfirmContext from '@/context/ConfirmContext';
import AsyncButton from '@/components/AsyncButton';
import useConfirmDialog from '@/hooks/useConfirmDialog';

import './index.scss';
import { ReportType } from '@/context/ReportContext';

const PatientEditField = ({
  value, onChange, label, name,
}: TextFieldProps) => (
  <TextField
    className="patient-dialog__text-field"
    label={label}
    value={value}
    name={name}
    onChange={onChange}
    variant="outlined"
    multiline
    fullWidth
  />
);

const FIELD_TO_DISPLAY_NAME = {
  alternateIdentifier: 'Alternate ID',
  biopsySite: 'Biopsy Site',
  biopsyName: 'Biopsy Name',
  caseType: 'Case Type',
  physician: 'Physician',
  gender: 'Gender',
  pediatricIds: 'Pediatric Patient IDs',
  kbDiseaseMatch: 'Tumour type for matching',
};

const DEFAULT_PATIENT_FIELDS_TO_UPDATE = ['caseType', 'physician', 'biopsySite', 'gender'];

const DEFAULT_REPORT_FIELDS_TO_UPDATE = ['alternateIdentifier', 'pediatricIds', 'biopsyName'];
const REPORT_FIELDS_TO_UPDATE = {
  default: DEFAULT_REPORT_FIELDS_TO_UPDATE,
  rapid: [...DEFAULT_REPORT_FIELDS_TO_UPDATE, 'kbDiseaseMatch'],
};

type PatientEditProps = {
  patientInformation: Record<string, unknown>;
  report: ReportType;
  isOpen: boolean;
  onClose: (
    newPatientData?: Record<string, unknown> | null,
    newReportData?: Record<string, unknown> | null
  ) => void;
};

const PatientEdit = ({
  patientInformation,
  report,
  isOpen,
  onClose,
}: PatientEditProps): JSX.Element => {
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const [newPatientData, setNewPatientData] = useState<PatientEditProps['patientInformation']>(null);
  const [newReportData, setNewReportData] = useState(null);
  const [patientDirty, setPatientDirty] = useState(false);
  const [reportDirty, setReportDirty] = useState(false);
  const [isApiCalling, setIsApiCalling] = useState(false);

  useEffect(() => {
    if (patientInformation) {
      setNewPatientData(patientInformation);
    }
  }, [patientInformation]);

  useEffect(() => {
    if (report) {
      setNewReportData(() => Object.entries(report).filter(([key]) => {
        const allowedFields = REPORT_FIELDS_TO_UPDATE[report.template.name] ?? REPORT_FIELDS_TO_UPDATE.default;
        return allowedFields.includes(key);
      }).reduce((acc, [key, val]) => ({
        ...acc,
        [key]: val,
      }), {}));
    }
  }, [report]);

  const handlePatientChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewPatientData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!patientDirty) {
      setPatientDirty(true);
    }
  }, [patientDirty]);

  const handleReportChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = event;
    setNewReportData((prevVal) => ({ ...prevVal, [name]: value }));

    if (!reportDirty) {
      setReportDirty(true);
    }
  }, [reportDirty]);

  const handleClose = useCallback(async (isSaved) => {
    if (isSaved) {
      setIsApiCalling(true);
      const apiCalls = [];

      if (newPatientData) {
        const {
          caseType, biopsySite, physician, gender,
        } = newPatientData;
        apiCalls.push(api.put(`/reports/${report.ident}/patient-information`, {
          caseType, biopsySite, physician, gender,
        }, {}));
      }

      if (newReportData) {
        apiCalls.push(api.put(`/reports/${report.ident}`, newReportData, {}));
      }

      const callSet = new ApiCallSet(apiCalls);

      if (isSigned) {
        setIsApiCalling(false);
        showConfirmDialog(callSet);
      } else {
        await callSet.request();
        setIsApiCalling(false);
        onClose(patientDirty ? newPatientData : null, reportDirty ? newReportData : null);
      }
    } else {
      onClose();
    }
  }, [newPatientData, newReportData, isSigned, onClose, patientDirty, reportDirty, report.ident, showConfirmDialog]);

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        Edit Patient Information
      </DialogTitle>
      {newPatientData && newReportData && (
        <DialogContent className="patient-dialog__content">
          {
            (REPORT_FIELDS_TO_UPDATE[report.template.name] ?? DEFAULT_REPORT_FIELDS_TO_UPDATE).map((fieldName) => (
              <PatientEditField
                value={newReportData[fieldName]}
                onChange={handleReportChange}
                label={FIELD_TO_DISPLAY_NAME[fieldName]}
                name={fieldName}
                key={fieldName}
              />
            ))
          }
          {
            DEFAULT_PATIENT_FIELDS_TO_UPDATE.map((fieldName) => (
              <PatientEditField
                value={newPatientData[fieldName]}
                onChange={handlePatientChange}
                label={FIELD_TO_DISPLAY_NAME[fieldName]}
                name={fieldName}
                key={fieldName}
              />
            ))
          }
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={() => handleClose(false)}>
          Close
        </Button>
        <AsyncButton color="secondary" onClick={() => handleClose(true)} isLoading={isApiCalling}>
          Save Changes
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

export default PatientEdit;
