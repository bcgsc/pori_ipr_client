import { ICellRendererParams } from '@ag-grid-community/core';
import React from 'react';

const HyperlinkCellRenderer = (pogId: ICellRendererParams): JSX.Element => {
  return (
    <a href={"/reports/patients/" + pogId.value}>{pogId.value}</a>
  );
}

export default HyperlinkCellRenderer;