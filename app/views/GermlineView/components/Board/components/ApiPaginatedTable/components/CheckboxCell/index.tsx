import React, { useCallback } from 'react';
import {
  Checkbox,
} from '@mui/material';

import { ICellRendererParams } from '@ag-grid-community/core';

import api from '@/services/api';

import './index.scss';
import snackbar from '@/services/SnackbarUtils';

type CheckboxCellProps = {
  isExportCell?: boolean;
} & ICellRendererParams;

const CheckboxCell = ({
  isExportCell = false,
  value,
  data,
  node,
}: CheckboxCellProps): JSX.Element => {
  const handleUnexport = useCallback(async (): Promise<void> => {
    if (value) {
      try {
        const resp = await api.put(`/germline-small-mutation-reports/${data.ident}`, { exported: false }).request();
        node.setData(resp);
        snackbar.success('Export removed');
      } catch (err) {
        console.error(err);
        snackbar.error(`Error removing export: ${err}`);
      }
    }
  }, [data.ident, node, value]);

  return (
    <Checkbox
      classes={{ root: 'checkbox-cell' }}
      checked={value}
      onClick={isExportCell ? handleUnexport : undefined}
    />
  );
};

export default CheckboxCell;
