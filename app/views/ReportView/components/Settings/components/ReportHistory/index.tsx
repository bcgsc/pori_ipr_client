import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  Typography,
} from '@mui/material';

import ReportContext from '@/context/ReportContext';
import { formatDate } from '@/utils/date';
import { ReportStateHistoryType, ReportUserHistoryType, UserType } from '@/common';
import { SignatureType } from '@/components/SignatureCard';

import './index.scss';
import { useReportSignaturesHistory, useReportStateHistory, useReportUserHistory } from '@/queries/get';

type HistoryEvent = {
  date: string | null;
  text: string;
};

const getUserName = (user?: UserType | null): string => {
  if (!user) { return 'Unknown user'; }
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.username;
};

const buildUserEvents = (userHistory: ReportUserHistoryType[]): HistoryEvent[] => (
  userHistory.flatMap((binding) => {
    const userName = getUserName(binding.user);
    const addedBy = binding.addedBy ? ` by ${getUserName(binding.addedBy)}` : '';
    const events: HistoryEvent[] = [{
      date: binding.createdAt,
      text: `${userName} added as ${binding.role}${addedBy} at: ${formatDate(binding.createdAt, true)}`,
    }];

    if (binding.deletedAt) {
      events.push({
        date: binding.deletedAt,
        text: `${userName} removed as ${binding.role} at: ${formatDate(binding.deletedAt, true)}`,
      });
    }

    return events;
  })
);

const ReportHistory = (): JSX.Element => {
  const { report } = useContext(ReportContext);
  const [orderedHistory, setOrderedHistory] = useState<string[]>([]);

  const { data: signatureHistoryData } = useReportSignaturesHistory<NonNullable<SignatureType>[]>(
    report.ident,
    {
      staleTime: Infinity,
      select: (response) => response,
    },
  );

  const { data: stateHistoryData } = useReportStateHistory<ReportStateHistoryType[]>(
    report.ident,
    {
      staleTime: Infinity,
      select: (response) => response,
    },
  );

  const { data: userHistoryData } = useReportUserHistory<ReportUserHistoryType[]>(
    report.ident,
    {
      staleTime: Infinity,
      select: (response) => response,
    },
  );

  const handleOrderReportHistory = useCallback((orderedHist): HistoryEvent[] => {
    const historyArray: HistoryEvent[] = [];
    let authorSigned = null;
    let creatorSigned = null;
    let reviewerSigned = null;

    for (const element of orderedHist) {
      if (Object.hasOwn(element, 'authorSignature')) {
        if (element.authorSignedAt !== authorSigned) {
          if (element.authorSignature) {
            historyArray.push({ date: element.authorSignedAt, text: `${element.authorSignature.firstName} ${element.authorSignature.lastName} signed as Author: ${formatDate(element.authorSignedAt, true)}` });
          } else {
            historyArray.push({ date: element?.updatedAt, text: `Author signature removed: ${formatDate(element?.updatedAt, true)}` });
          }
          authorSigned = element.authorSignedAt;
        }
        if (element.creatorSignedAt !== creatorSigned) {
          if (element.creatorSignature) {
            historyArray.push({ date: element.creatorSignedAt, text: `${element.creatorSignature.firstName} ${element.creatorSignature.lastName} signed as Creator: ${formatDate(element.creatorSignedAt, true)}` });
          } else {
            historyArray.push({ date: element?.updatedAt, text: `Creator signature removed: ${formatDate(element?.updatedAt, true)}` });
          }
          creatorSigned = element.creatorSignedAt;
        }
        if (element.reviewerSignedAt !== reviewerSigned) {
          if (element.reviewerSignature) {
            historyArray.push({ date: element.reviewerSignedAt, text: `${element.reviewerSignature.firstName} ${element.reviewerSignature.lastName} signed as Reviewer: ${formatDate(element.reviewerSignedAt, true)}` });
          } else {
            historyArray.push({ date: element?.updatedAt, text: `Reviewer signature removed: ${formatDate(element?.updatedAt, true)}` });
          }
          reviewerSigned = element.reviewerSignedAt;
        }
      }

      if (Object.hasOwn(element, 'state')) {
        historyArray.push({ date: element?.updatedAt, text: `Report updated to ${element.state} at: ${formatDate(element?.updatedAt, true)}` });
      }
    }

    return historyArray;
  }, []);

  useEffect(() => {
    if (signatureHistoryData && stateHistoryData && userHistoryData) {
      const signatureAndStateArr = [...signatureHistoryData, ...stateHistoryData].filter((item) => item !== null);
      signatureAndStateArr.sort((a, b) => new Date(a?.updatedAt).valueOf() - new Date(b?.updatedAt).valueOf());

      const events = [
        ...handleOrderReportHistory(signatureAndStateArr),
        ...buildUserEvents(userHistoryData),
      ];
      events.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());

      setOrderedHistory(events.map(({ text }) => text));
    }
  }, [handleOrderReportHistory, signatureHistoryData, stateHistoryData, userHistoryData]);

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
            <span key={`${result.toString()}-${idx}`}>
              {result}
              <br />
            </span>
          )) : null}
        </Typography>
      </div>
    </div>
  );
};

export default ReportHistory;
