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

const Analysis = (): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);

  const handleAnalysisStart = useCallback(async () => {
    try {
      const date = new Date();
      await api.put(`/reports/${report.ident}`, { analysisStartedAt: date.toISOString() }, {}).request();
      snackbar.success('Analysis started!');
    } catch (err) {
      snackbar.error(`Error starting analysis: ${err}`);
    }
  }, [report]);

  return (
    <div>
      <Typography variant="h3">Analysis Status</Typography>
      {report?.analysisStartedAt ? (
        <div>
          <Typography>
            Analysis started on:
            {` ${formatDate(report?.analysisStartedAt, true)}`}
          </Typography>
        </div>
      ) : (
        <div>
          <Button
            color="secondary"
            disabled={!canEdit}
            onClick={handleAnalysisStart}
            variant="outlined"
          >
            Start analysis
          </Button>
        </div>
      )}
    </div>
  );
};

export default Analysis;
