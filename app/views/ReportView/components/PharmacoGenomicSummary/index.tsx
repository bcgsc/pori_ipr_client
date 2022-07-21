import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '@mui/material/Alert';

import api, { ApiCallSet } from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import UserContext from '@/context/UserContext';
import ConfirmContext from '@/context/ConfirmContext';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import { formatDate } from '@/utils/date';
import SignatureCard, { SignatureType } from '@/components/SignatureCard';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import PrintTable from '@/components/PrintTable';
import TestInformation, { TestInformationType } from '@/components/TestInformation';
import { KbMatchType } from '@/common';
import PatientEdit from '@/components/PatientEdit';
import {
  sampleColumnDefs,
  pharmacoGenomicColumnDefs,
  pharmacoGenomicPrintColumnDefs,
  cancerPredisColumnDefs,
  cancerPredisPrintColumnDefs,
} from './columnDefs';

import './index.scss';

type PharmacoGenomicSummaryProps = {
  loadedDispatch: (type: { type: string }) => void;
  isPrint: boolean;
} & WithLoadingInjectedProps;

const PharmacoGenomicSummary = ({
  loadedDispatch,
  isPrint,
  setIsLoading,
}: PharmacoGenomicSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useContext(UserContext);
  const { isSigned, setIsSigned } = useContext(ConfirmContext);

  const [testInformation, setTestInformation] = useState<TestInformationType>();
  const [signatures, setSignatures] = useState<SignatureType | null>();
  const [pharmacoGenomic, setPharmacoGenomic] = useState<KbMatchType[]>([]);
  const [cancerPredisposition, setCancerPredisposition] = useState<KbMatchType[]>([]);
  const [patientInformation, setPatientInformation] = useState<{
    label: string;
    value: string | null;
  }[] | null>();

  const [showPatientEdit, setShowPatientEdit] = useState(false);

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        try {
          const probeTestInfoResp = await api.get(`/reports/${report.ident}/probe-test-information`).request();
          setTestInformation(probeTestInfoResp);
        } catch (err) {
          snackbar.error(`Error getting probe-test-information: ${err}`);
        }

        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/signatures`),
            api.get(`/reports/${report.ident}/kb-matches?category=pharmacogenomic`),
            api.get(`/reports/${report.ident}/kb-matches?category=cancer predisposition`),
          ]);

          const [
            signaturesData,
            pharmacoGenomicResp,
            cancerPredispositionResp,
          ] = await apiCalls.request() as [SignatureType, KbMatchType[], KbMatchType[]];

          setSignatures(signaturesData);
          setPharmacoGenomic(pharmacoGenomicResp.filter(({ variant }) => variant.germline));
          // Assumed to be germline when it gets to this part, so filtering no longer necessary
          setCancerPredisposition(cancerPredispositionResp.filter(({ variant }) => variant.germline));

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

          if (loadedDispatch) {
            loadedDispatch({ type: 'summary' });
          }
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [loadedDispatch, report, setIsLoading]);

  const handlePatientEditClose = useCallback(async (isSaved, newPatientData, newReportData) => {
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

  const handleSign = useCallback(async (signed: boolean, role: 'author' | 'reviewer') => {
    let newSignature: SignatureType;

    if (signed) {
      newSignature = await api.put(`/reports/${report.ident}/signatures/sign/${role}`, {}).request();
    } else {
      newSignature = await api.put(`/reports/${report.ident}/signatures/revoke/${role}`, {}).request();
    }

    setIsSigned(signed);
    setSignatures(newSignature);
  }, [report, setIsSigned]);

  const pharmacogenomicSection = useMemo(() => {
    let component = (
      <div className="summary__none">
        No pharmacogenomic variants found
      </div>
    );

    if (pharmacoGenomic.length > 0) {
      let tableComponent = null;
      if (isPrint) {
        tableComponent = (
          <PrintTable
            columnDefs={pharmacoGenomicPrintColumnDefs}
            data={pharmacoGenomic}
          />
        );
      } else {
        tableComponent = (
          <DataTable
            columnDefs={pharmacoGenomicColumnDefs}
            rowData={pharmacoGenomic}
            isPrint={isPrint}
            isPaginated={!isPrint}
          />
        );
      }
      component = (
        <>
          {tableComponent}
          <Alert className="summary--max-width" severity="warning">
            Positive Pharmacogenomic Result: At least one pharmacogenomic variant was identified in this sample. Further clinical testing to determine risk of toxicity is recommended for this patient.
          </Alert>
        </>
      );
    }
    return component;
  }, [pharmacoGenomic, isPrint]);

  const cancerPredispositionSection = useMemo(() => {
    let component = (
      <div className="summary__none">
        No cancer predisposition variants found
      </div>
    );
    if (cancerPredisposition.length > 0) {
      let tableComponent = null;
      if (isPrint) {
        tableComponent = (
          <PrintTable
            columnDefs={cancerPredisPrintColumnDefs}
            data={cancerPredisposition}
          />
        );
      } else {
        tableComponent = (
          <DataTable
            columnDefs={cancerPredisColumnDefs}
            rowData={cancerPredisposition}
            isPrint={isPrint}
            isPaginated={!isPrint}
          />
        );
      }
      component = (
        <>
          {tableComponent}
          <Alert className="summary--max-width" severity="warning">
            Positive Cancer Predisposition Result: At least one pathogenic cancer predisposition variant was identified in this sample. A referral to the Hereditary Cancer Program is recommended for this patient.
          </Alert>
        </>
      );
    }
    return component;
  }, [cancerPredisposition, isPrint]);

  return (
    <div className="summary">
      {report && (
        <>
          {patientInformation && (
            <div className="summary__patient-information">
              <div className="summary__patient-information-title">
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
                className="summary__patient-information-content"
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
          <div className="summary__pharmacogenomic">
            <Typography variant="h3" display="inline">
              Pharmacogenomic Variants
            </Typography>
            {pharmacogenomicSection}
          </div>
          <div className="summary__cancer-predisposition">
            <Typography variant="h3" display="inline">
              Cancer Predisposition Variants
            </Typography>
            {cancerPredispositionSection}
          </div>
          {report?.sampleInfo && (
            <>
              <Typography variant="h3" display="inline" className="summary__sample-information-title">
                Sample Information
              </Typography>
              {isPrint ? (
                <PrintTable
                  columnDefs={sampleColumnDefs}
                  data={report.sampleInfo}
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
          {testInformation && (
            <div className="summary__test-information">
              <Typography variant="h3" className="summary__test-information-title">
                Test Information
              </Typography>
              <TestInformation
                data={testInformation}
                isPharmacogenomic
              />
              <Typography className="summary--max-width summary__test-information-text">
                The Pharmacogenomic and Cancer Predisposition Targeted Gene Report (PCP-TGR) provides results from a rapid analysis pipeline designed to identify known pharmacogenomic and pathogenic germline cancer predisposition variants in a select set of genes associated with drug toxicity and cancer predisposition. This rapid analysis is not a complete description of abberations associated with cancer predisposition or drug toxicity. The absence of a specific variant in this report is not a guarantee that the variant is not present. Somatic variants are not included in this report.
              </Typography>
            </div>
          )}
          <div className="summary__reviews">
            <Typography variant="h3" className="summary__reviews-title">
              Reviews
            </Typography>
            <div className="summary__signatures">
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
          </div>
        </>
      )}
    </div>
  );
};

export default withLoading(PharmacoGenomicSummary);
