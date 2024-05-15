import React, { useContext, useCallback, useMemo } from 'react';
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

  return (
    <div className="analysis">
      <Typography variant="h3">Analysis Status</Typography>
      <div className="analysis__content">
        {report?.analysisStartedAt ? (
          <Typography>
            Analysis started on:
            {` ${formatDate(report?.analysisStartedAt, true)}`}
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
