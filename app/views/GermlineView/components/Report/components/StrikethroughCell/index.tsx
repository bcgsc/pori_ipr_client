import React, { useState, useContext, useCallback } from 'react';
import {
  IconButton,
} from '@mui/material';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import { ICellRendererParams } from '@ag-grid-community/core';

import api from '@/services/api';
import GermlineReportContext from '@/context/GermlineReportContext';
import snackbar from '@/services/SnackbarUtils';

const StrikethroughCell = (params: ICellRendererParams): JSX.Element => {
  const { report, refetchReport } = useContext(GermlineReportContext);

  const { data: { ident: variantIdent, hidden: initialHidden } } = params;
  const [isHidden, setIsHidden] = useState<boolean>(initialHidden);

  const handleChange = useCallback(async () => {
    if (!report) { return; }
    try {
      await api.put(
        `/germline-small-mutation-reports/${report.ident}/variants/${variantIdent}`,
        { hidden: !isHidden },
        {},
      ).request();
      setIsHidden((prevVal) => !prevVal);
      refetchReport();
      snackbar.success('Visibility updated');
    } catch (err) {
      snackbar.error(`Failed to update variant with visibility change: ${err}`);
    }
  }, [isHidden, variantIdent, report, refetchReport]);

  return (
    <IconButton onClick={handleChange} size="large">
      <StrikethroughSIcon fontSize="small" />
    </IconButton>
  );
};

export default StrikethroughCell;
