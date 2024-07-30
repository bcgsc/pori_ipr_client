import React, { useContext, useCallback, useMemo, useEffect, useState } from 'react';
import {
  Button,
  Tooltip,
  Typography,
} from '@mui/material';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import useSecurity from '@/hooks/useSecurity';
import useResource from '@/hooks/useResource';
import snackbar from '@/services/SnackbarUtils';
import { formatDate } from '@/utils/date';

import './index.scss';

const Analysis = (): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { userDetails } = useSecurity();
  const { adminAccess } = useResource();
  let { reportEditAccess: canEdit } = useResource();
  const [signatureHistory, setSignatureHistory] = useState([]);
  if (report.state === 'completed') {
    canEdit = false;
  }

  const handleAnalysisStart = useCallback(async () => {
    try {
      const date = new Date();
      const newReport = await api.put(
        `/reports/${report.ident}`,
        { analysisStartedAt: date.toISOString() },
        {},
      ).request();
      setReport(newReport);
      snackbar.success('Analysis started!');
    } catch (err) {
      snackbar.error(`Error starting analysis: ${err}`);
    }
  }, [report, setReport]);

  const isAssigned = useMemo(() => {
    if (report.users.map((u) => u.user.username).includes(userDetails.username)) {
      return true;
    }
    return false;
  }, [report, userDetails]);

  const processSignatureHistory = useEffect( () => { 
    async function fetchData() {
        try {
          const signatureHistory = await api.get(
            `/reports/${report.ident}/signatures/history`
          ).request();

          const historyArray = [];
          let authorSigned = null;
          let creatorSigned = null;
          let reviewerSigned = null;

          for (const element of signatureHistory) {
            if (element.authorSignedAt!== authorSigned) {
              if (element.authorSignature) {
                historyArray.push(`${element.authorSignature.firstName} ${element.authorSignature.lastName} signed as Author: ${formatDate(element.authorSignedAt, true)}`)
              } else {
                historyArray.push(`Author signature removed: ${formatDate(element.updatedAt, true)}`)
              }
              authorSigned = element.authorSignedAt;
            }
            if (element.creatorSignedAt!== creatorSigned) {
              if (element.creatorSignature) {
                historyArray.push(`${element.creatorSignature.firstName} ${element.creatorSignature.lastName} signed as Creator: ${formatDate(element.creatorSignedAt, true)}`)
              } else {
                historyArray.push(`Creator signature removed: ${formatDate(element.updatedAt, true)}`)
              }
              creatorSigned = element.creatorSignedAt;
            }
            if (element.reviewerSignedAt!== reviewerSigned) {
              if (element.reviewerSignature) {
                historyArray.push(`${element.reviewerSignature.firstName} ${element.reviewerSignature.lastName} signed as Reviewer: ${formatDate(element.reviewerSignedAt, true)}`)
              } else {
                historyArray.push(`Reviewer signature removed: ${formatDate(element.updatedAt, true)}`)
              }
              reviewerSigned = element.reviewerSignedAt;
            }
          }

          setSignatureHistory(historyArray)
        } catch (err) {
            console.log(err);
        }
    }
    fetchData();
}, [report]);

  return (
    <div className="analysis">
      <Typography variant="h3">Analysis Status</Typography>
      <div className="analysis__content">
        {report?.analysisStartedAt ? (
          <Typography>
            Analysis started on:
            {` ${formatDate(report?.analysisStartedAt, true)}`}
            <br />
            {
            signatureHistory.map((result, index) => (
              <div key={index}>
                {result}
                <br />
              </div>
            ))}
          </Typography>
        ) : (
          <>
            {!isAssigned && !adminAccess ? (
              <Tooltip
                placement="right"
                title="Only assigned users can start the analysis"
              >
                <span>
                  <Button
                    color="secondary"
                    disabled
                    onClick={handleAnalysisStart}
                    variant="outlined"
                  >
                    Start analysis
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                disabled={!canEdit}
                color="secondary"
                onClick={handleAnalysisStart}
                variant="outlined"
              >
                Start analysis
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;
