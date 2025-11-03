import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  Typography,
} from '@mui/material';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import { formatDate } from '@/utils/date';

import './index.scss';
import { useQuery } from 'react-query';

const ReportHistory = (): JSX.Element => {
  const { report } = useContext(ReportContext);
  const [orderedHistory, setOrderedHistory] = useState([]);

  const { data: signatureHistoryData } = useQuery(
    `/reports/${report.ident}/signatures/history`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      select: (response) => response,
    },
  );

  const { data: stateHistoryData } = useQuery(
    `/reports/${report.ident}/state-history`,
    async ({ queryKey: [route] }) => api.get(route).request(),
    {
      staleTime: Infinity,
      select: (response) => response,
    },
  );

  const handleOrderReportHistory = useCallback((orderedHist) => {
    const historyArray = [];
    let authorSigned = null;
    let creatorSigned = null;
    let reviewerSigned = null;

    for (const element of orderedHist) {
      if (Object.hasOwn(element, 'authorSignature')) {
        if (element.authorSignedAt !== authorSigned) {
          if (element.authorSignature) {
            historyArray.push(`${element.authorSignature.firstName} ${element.authorSignature.lastName} signed as Author: ${formatDate(element.authorSignedAt, true)}`);
          } else {
            historyArray.push(`Author signature removed: ${formatDate(element?.updatedAt, true)}`);
          }
          authorSigned = element.authorSignedAt;
        }
        if (element.creatorSignedAt !== creatorSigned) {
          if (element.creatorSignature) {
            historyArray.push(`${element.creatorSignature.firstName} ${element.creatorSignature.lastName} signed as Creator: ${formatDate(element.creatorSignedAt, true)}`);
          } else {
            historyArray.push(`Creator signature removed: ${formatDate(element?.updatedAt, true)}`);
          }
          creatorSigned = element.creatorSignedAt;
        }
        if (element.reviewerSignedAt !== reviewerSigned) {
          if (element.reviewerSignature) {
            historyArray.push(`${element.reviewerSignature.firstName} ${element.reviewerSignature.lastName} signed as Reviewer: ${formatDate(element.reviewerSignedAt, true)}`);
          } else {
            historyArray.push(`Reviewer signature removed: ${formatDate(element?.updatedAt, true)}`);
          }
          reviewerSigned = element.reviewerSignedAt;
        }
      }

      if (Object.hasOwn(element, 'state')) {
        historyArray.push(`Report updated to ${element.state} at: ${formatDate(element?.updatedAt, true)}`);
      }

      if (Object.hasOwn(element, 'user')) {
        historyArray.push(`${element.user.firstName} ${element.user.lastName} assigned at: ${formatDate(element?.updatedAt, true)}`);
      }
    }

    return historyArray;
  }, []);

  useEffect(() => {
    if (signatureHistoryData && stateHistoryData && report.users) {
      const historyArr = signatureHistoryData.concat(stateHistoryData).concat(report.users).filter((item) => item !== null);
      historyArr.sort((a, b) => new Date(a?.updatedAt).valueOf() - new Date(b?.updatedAt).valueOf());
      const orderedHistoryArr = historyArr.length > 0 ? handleOrderReportHistory(historyArr) : [];
      setOrderedHistory(orderedHistoryArr);
    }
  }, [handleOrderReportHistory, signatureHistoryData, stateHistoryData, report.users]);

  return (
    <div className="analysis">
      <Typography variant="h3">Report History</Typography>
      <div className="analysis__content">
        <Typography>
          {`Report created at: ${formatDate(report?.createdAt, true)}`}
          <br />
          {report?.analysisStartedAt ? (
            <>
              Analysis started on:
              {` ${formatDate(report?.analysisStartedAt, true)}`}
              <br />
            </>
          ) : null}
          {orderedHistory ? orderedHistory.map((result, idx) => (
            /* eslint-disable-next-line react/no-array-index-key */
            <div key={`${result.toString()}-${idx}`}>
              {result}
              <br />
            </div>
          )) : null}
        </Typography>
      </div>
    </div>
  );
};

export default ReportHistory;
