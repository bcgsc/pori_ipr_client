import React, { useContext, useCallback } from 'react';
import {
  Button,
  Typography,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/components/ReportContext';
import EditContext from '@/components/EditContext';
import snackbar from '@/services/SnackbarUtils';
import { formatDate } from '@/utils/date';

import './index.scss';

const Analysis = (): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);

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
          <Button
            color="secondary"
            disabled={!canEdit}
            onClick={handleAnalysisStart}
            variant="outlined"
          >
            Start analysis
          </Button>
        )}
      </div>
    </div>
  );
};

export default Analysis;
