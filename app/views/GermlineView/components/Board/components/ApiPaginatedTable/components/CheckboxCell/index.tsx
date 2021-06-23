import React from 'react';
import {
  Checkbox,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { ICellRendererParams } from 'ag-grid-community';

import api from '@/services/api';

import './index.scss';

type CheckboxCellProps = {
  isExportCell?: boolean;
} & ICellRendererParams;

const CheckboxCell = ({
  isExportCell = false,
  value,
  data,
  node,
}: CheckboxCellProps): JSX.Element => {
  const snackbar = useSnackbar();

  const handleUnexport = async (): Promise<void> => {
    if (value) {
      try {
        const resp = await api.put(`/germline-small-mutation-reports/${data.ident}`, { exported: false }, {}).request();
        node.setData(resp);
        snackbar.enqueueSnackbar('Export removed', { variant: 'success' });
      } catch (err) {
        snackbar.enqueueSnackbar(`Error removing export: ${err}`, { variant: 'error' });
      }
    }
  };

  return (
    <Checkbox
      classes={{ root: 'checkbox-cell' }}
      checked={value}
      onClick={isExportCell ? handleUnexport : undefined}
    />
  );
};

export default CheckboxCell;
