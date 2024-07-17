import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import ReportContext, { ReportType, PatientInformationType } from '@/context/ReportContext';
import { formatDate } from '@/utils/date';
import PatientEdit from '@/components/PatientEdit';
import snackbar from '@/services/SnackbarUtils';
import SummaryPrintTable from '@/components/SummaryPrintTable';
import './index.scss';

type PatientInformationProps = {
  loadedDispatch: ({ type }: { type: string }) => void;
  canEdit: boolean;
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
};

const PatientInformation = ({
  loadedDispatch,
  canEdit,
  isPrint,
  printVersion,
}: PatientInformationProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [patientInformation, setPatientInformation] = useState<{
    label: string;
    value: string | null;
  }[] | null>();

  const classNamePrefix = isPrint ? 'patient-information--print' : 'patient-information';

  useEffect(() => {
    if (report?.ident) {
      const getData = async () => {
        try {
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
            {
              label: 'Biopsy Collection Date',
              value: report?.reportSampleInfo?.find((info) => info.sample === 'Tumour')?.collectionDate,
            },
            {
              label: 'Biopsy Type',
              value: report?.reportSampleInfo?.find((info) => info.sample === 'Tumour')?.biopsyType,
            },
          ]);
        } catch (err) {
          snackbar.error(`Unknown error: ${err}`);
        } finally {
          if (loadedDispatch) {
            loadedDispatch({ type: 'patient' });
          }
        }
      };

      getData();
    }
  }, [loadedDispatch, report, isPrint]);

  const handlePatientEditClose = useCallback((
    newPatientData: PatientInformationType,
    newReportData: ReportType,
  ) => {
    setShowPatientEdit(false);

    if (!newPatientData && !newReportData) {
      return;
    }

    if (newReportData) {
      setReport((oldReport) => ({ ...oldReport, ...newReportData }));
    }

    if (newPatientData) {
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
    }
  }, [report, setReport]);

  if (isPrint && printVersion === 'condensedLayout') {
    return (
      <div className={`${classNamePrefix}`}>
        <div className={`${classNamePrefix}__title`}>
          <Typography variant="h5" fontWeight="bold" display="inline">
            Patient Information
          </Typography>
        </div>
        {report && patientInformation && (
          <SummaryPrintTable
            data={patientInformation}
            labelKey="label"
            valueKey="value"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`${classNamePrefix}`}>
      <div className={`${classNamePrefix}__title`}>
        <Typography variant="h3">
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
      {report && patientInformation && (
      <Grid
        alignItems="flex-end"
        container
        spacing={3}
        className={`${classNamePrefix}__content`}
      >
        {patientInformation.map(({ label, value }) => (
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
