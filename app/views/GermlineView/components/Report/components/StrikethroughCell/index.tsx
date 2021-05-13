import React, { useState, useContext, useCallback } from 'react';
import {
  IconButton,
} from '@material-ui/core';
import StrikethroughSIcon from '@material-ui/icons/StrikethroughS';
import { ICellRendererParams } from '@ag-grid-community/core';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';

const StrikethroughCell = (params: ICellRendererParams): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);

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
    <IconButton onClick={handleChange}>
      <StrikethroughSIcon fontSize="small" />
    </IconButton>
  );
};

export default StrikethroughCell;
