import React from 'react';
import { INoRowsOverlayReactComp } from '@ag-grid-community/react';

import './index.scss';

const NoRowsOverlay = ({
  agGridReact: { gridOptions: { columnDefs } },
}: INoRowsOverlayReactComp): JSX.Element => (
  <div className={`no-rows ${columnDefs.some((col) => col.children) ? 'no-rows--children' : ''}`}>
    No Rows To Show
  </div>
);

export default NoRowsOverlay;
