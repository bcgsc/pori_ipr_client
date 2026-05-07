import React from 'react';
import type { INoRowsOverlayParams } from '@ag-grid-community/core';

import './index.scss';

interface NoRowsOverlayProps extends INoRowsOverlayParams {
  hasChildren?: boolean;
}

const NoRowsOverlay = ({ hasChildren }: NoRowsOverlayProps): JSX.Element => (
  <div className={`no-rows ${hasChildren ? 'no-rows--children' : ''}`}>
    No Rows To Show
  </div>
);

export default NoRowsOverlay;
