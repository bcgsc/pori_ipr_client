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
  const { report, setReport } = useContext(GermlineReportContext);

  const [isHidden, setIsHidden] = useState<boolean>(params.data.hidden);

  const handleChange = useCallback(async () => {
    try {
      const updatedVariant = await api.put(
        `/germline-small-mutation-reports/${report.ident}/variants/${params.data.ident}`,
        { hidden: !isHidden },
        {},
      ).request();
      setIsHidden((prevVal) => !prevVal);
      setReport((prevVal) => {
        const index = prevVal.variants.findIndex((variant) => variant.ident === updatedVariant.ident);
        const newVariants = [...prevVal.variants];
        newVariants[index] = updatedVariant;
        return { ...prevVal, variants: newVariants };
      });
      snackbar.success('Visibility updated');
    } catch (err) {
      snackbar.error(`Failed to update variant with visibility change: ${err}`);
    }
  }, [isHidden, params, report, setReport]);

  return (
    <IconButton onClick={handleChange} size="large">
      <StrikethroughSIcon fontSize="small" />
    </IconButton>
  );
};

export default StrikethroughCell;
