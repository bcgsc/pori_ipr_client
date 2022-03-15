import React from 'react';
import { AgGridReactProps } from '@ag-grid-community/react';

import './index.scss';

const NoRowsOverlay = (
  { api }: AgGridReactProps,
): JSX.Element => (
  <div className={`no-rows ${api.getColumnDefs().some((col) => 'children' in col) ? 'no-rows--children' : ''}`}>
    No Rows To Show
  </div>
);

export default NoRowsOverlay;
